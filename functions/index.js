/**
 * HEALINK MVP - FIREBASE CLOUD FUNCTIONS
 * 
 * Entry point for all Cloud Functions
 */

const { dailyAftercare } = require('./dailyAftercare');

// Export scheduled function
exports.dailyAftercare = dailyAftercare;
