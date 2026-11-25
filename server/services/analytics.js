const TranscriptEvent = require('../models/TranscriptEvent');
const Room = require('../models/Room');

/**
 * MongoDB Aggregation Pipeline: Classroom Lecture Analytics
 * Uses $match, $facet, $group, $sort, and $project to extract deep classroom insights.
 */
async function getRoomAnalytics(roomId) {
  try {
    const pipeline = [
      // Stage 1: Match all finalized or corrected captions for this room
      {
        $match: {
          roomId: roomId,
          status: { $in: ['final', 'corrected'] }
        }
      },
      // Stage 2: Facet into multiple parallel analytical aggregations
      {
        $facet: {
          // A. Speaker Talk-Time & Performance Metrics
          speakerBreakdown: [
            {
              $group: {
                _id: '$participantName',
                totalUtterances: { $sum: 1 },
                avgConfidence: { $avg: '$confidence' },
                languagesUsed: { $addToSet: '$language' },
                firstSpoke: { $min: '$timestamp' },
                lastSpoke: { $max: '$timestamp' }
              }
            },
            {
              $project: {
                speaker: '$_id',
                totalUtterances: 1,
                avgConfidence: { $round: [{ $multiply: ['$avgConfidence', 100] }, 1] },
                languagesUsed: 1,
                durationMinutes: {
                  $round: [
                    { $divide: [{ $subtract: ['$lastSpoke', '$firstSpoke'] }, 60000] },
                    1
                  ]
                }
              }
            },
            { $sort: { totalUtterances: -1 } }
          ],

          // B. Language Distribution
          languageBreakdown: [
            {
              $group: {
                _id: '$language',
                count: { $sum: 1 }
              }
            },
            {
              $project: {
                language: '$_id',
                count: 1
              }
            },
            { $sort: { count: -1 } }
          ],

          // C. Confidence & Uncertainty Overview
          qualityMetrics: [
            {
              $group: {
                _id: null,
                totalFinalCaptions: { $sum: 1 },
                highConfidenceCount: {
                  $sum: { $cond: [{ $gte: ['$confidence', 0.85] }, 1, 0] }
                },
                uncertainCount: {
                  $sum: { $cond: [{ $lt: ['$confidence', 0.85] }, 1, 0] }
                },
                correctedCount: {
                  $sum: { $cond: [{ $eq: ['$status', 'corrected'] }, 1, 0] }
                },
                avgRoomConfidence: { $avg: '$confidence' }
              }
            },
            {
              $project: {
                _id: 0,
                totalFinalCaptions: 1,
                highConfidenceCount: 1,
                uncertainCount: 1,
                correctedCount: 1,
                avgRoomConfidence: {
                  $round: [{ $multiply: ['$avgRoomConfidence', 100] }, 1]
                }
              }
            }
          ]
        }
      }
    ];

    const results = await TranscriptEvent.aggregate(pipeline);
    const data = results[0] || {};

    const quality = (data.qualityMetrics && data.qualityMetrics[0]) || {
      totalFinalCaptions: 0,
      highConfidenceCount: 0,
      uncertainCount: 0,
      correctedCount: 0,
      avgRoomConfidence: 100
    };

    return {
      success: true,
      roomId,
      dataSource: 'MongoDB Aggregation Pipeline',
      storageInfo: {
        isLocal: true,
        mode: 'Local MongoDB Instance (On-Device)',
        uri: 'mongodb://127.0.0.1:27017/nexhack_captions',
        dbPath: 'C:\\Program Files\\MongoDB\\Server\\9.0\\data',
        collections: ['transcriptevents', 'rooms'],
        diskBackup: `server/data/${roomId}.json`
      },
      quality,
      speakers: data.speakerBreakdown || [],
      languages: data.languageBreakdown || []
    };
  } catch (err) {
    console.error('[Analytics Aggregation Error]:', err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * MongoDB Aggregation Pipeline: Aggregated Paragraphs Synthesis
 */
async function getAggregatedParagraphs(roomId) {
  try {
    const pipeline = [
      {
        $match: {
          roomId: roomId,
          status: { $in: ['final', 'corrected'] }
        }
      },
      {
        $sort: { timestamp: 1 }
      },
      {
        $group: {
          _id: '$participantName',
          paragraphText: { $push: '$text' },
          translatedText: { $push: '$translation' },
          count: { $sum: 1 },
          startTime: { $min: '$timestamp' },
          endTime: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          speaker: '$_id',
          count: 1,
          startTime: 1,
          endTime: 1,
          originalParagraph: {
            $reduce: {
              input: '$paragraphText',
              initialValue: '',
              in: { $concat: ['$$value', { $cond: [{ $eq: ['$$value', ''] }, '', ' '] }, '$$this'] }
            }
          },
          translatedParagraph: {
            $reduce: {
              input: '$translatedText',
              initialValue: '',
              in: { $concat: ['$$value', { $cond: [{ $eq: ['$$value', ''] }, '', ' '] }, '$$this'] }
            }
          }
        }
      }
    ];

    const paragraphs = await TranscriptEvent.aggregate(pipeline);
    return { success: true, paragraphs };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * MongoDB Aggregation Pipeline: Chronological Voice History & Notes
 * Orders speeches so whatever was spoken first in time appears first ($sort: { timestamp: 1 }).
 * Uses indexed compound keys { roomId: 1, timestamp: 1 } for sub-millisecond execution.
 */
async function getChronologicalTimeline(roomId, sortDirection = 1) {
  try {
    const pipeline = [
      {
        $match: {
          roomId: roomId,
          status: { $in: ['final', 'corrected'] }
        }
      },
      // MongoDB Aggregation Pipeline Sort Stage:
      // sortDirection = 1 ensures earlier spoken speech appears first in time!
      {
        $sort: { timestamp: sortDirection }
      },
      {
        $project: {
          _id: 0,
          eventId: 1,
          roomId: 1,
          participantId: 1,
          participantName: 1,
          language: 1,
          text: 1,
          translation: 1,
          type: 1,
          status: 1,
          confidence: 1,
          timestamp: 1,
          formattedTime: {
            $dateToString: {
              format: '%H:%M:%S',
              date: { $toDate: '$timestamp' }
            }
          }
        }
      }
    ];

    const events = await TranscriptEvent.aggregate(pipeline);
    return {
      success: true,
      roomId,
      pipelineStage: '$sort: { timestamp: 1 } (Chronological Time Order)',
      count: events.length,
      events
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * MongoDB Indexed Full-Text Search
 */
async function searchTranscripts(roomId, query) {
  try {
    const results = await TranscriptEvent.find(
      {
        roomId,
        $text: { $search: query }
      },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    return { success: true, results, count: results.length };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = {
  getRoomAnalytics,
  getAggregatedParagraphs,
  getChronologicalTimeline,
  searchTranscripts
};
