// Matching engine: checks if a student is eligible for an opportunity
// and gives each opportunity a score so the best ones show first.

import { scamCheck } from './scamCheck.js'

// Check every rule of an opportunity against the student's profile.
// Returns the rules the student meets and the rules they are missing,
// so we can say "You are eligible" or exactly what is missing.
export function checkEligibility(opp, profile) {
  const rules = opp.eligibility
  const met = []
  const missing = []

  // Small helper: put the rule in the right list
  const check = (passed, key, params = {}) => (passed ? met : missing).push({ key, params })

  if (rules.minAge || rules.maxAge) {
    const okMin = !rules.minAge || profile.age >= rules.minAge
    const okMax = !rules.maxAge || profile.age <= rules.maxAge
    check(okMin && okMax, 'age', { min: rules.minAge, max: rules.maxAge })
  }

  if (rules.education) {
    check(rules.education.includes(profile.education), 'education', { allowed: rules.education })
  }

  if (rules.streams) {
    check(rules.streams.includes(profile.stream), 'stream', { allowed: rules.streams })
  }

  if (rules.gender) {
    check(profile.gender === rules.gender, 'gender', { gender: rules.gender })
  }

  if (rules.categories) {
    check(rules.categories.includes(profile.category), 'category', { allowed: rules.categories })
  }

  // Family income is saved as the top of the range the student picked (in lakh per year)
  if (rules.maxIncome) {
    check(profile.income <= rules.maxIncome, 'income', { max: rules.maxIncome })
  }

  if (rules.minMarks) {
    check(profile.marks >= rules.minMarks, 'marks', { min: rules.minMarks })
  }

  if (rules.notEmployed) {
    check(!profile.employed, 'notEmployed')
  }

  return { eligible: missing.length === 0, met, missing }
}

// Days left until the deadline (0 = today, negative = closed)
export function daysLeft(opp) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((opp.deadline - today) / 86400000)
}

// Give a score out of 100. Higher = shown first.
// It mixes 4 things: eligibility, interest match, money/benefits and how soon the deadline is.
function scoreOpportunity(opp, profile, eligibility) {
  let score = 0

  // Eligible students should see these first
  if (eligibility.eligible) score += 35
  else if (eligibility.missing.length === 1) score += 10 // close, only one thing missing

  // Interest match
  const common = opp.interests.filter((i) => profile.interests.includes(i))
  if (common.length > 0) score += 20 + Math.min(common.length - 1, 2) * 5

  // Money and benefits
  score += Math.min(opp.monthlyValue / 1000, 10)
  if (opp.travelSupport) score += 3
  if (opp.remote && profile.prefersRemote) score += 7

  // Closing soon = more urgent
  const left = daysLeft(opp)
  if (left <= 7) score += 10
  else if (left <= 14) score += 6
  else score += 2

  return Math.round(Math.min(score, 100))
}

// Build the student's feed.
// Returns matched opportunities sorted best first, plus the listings blocked by the scam check.
export function buildFeed(opportunities, profile) {
  const matches = []
  const blocked = []

  for (const opp of opportunities) {
    if (daysLeft(opp) < 0) continue // hide closed ones

    const safety = scamCheck(opp)
    const eligibility = checkEligibility(opp, profile)
    const item = { opp, safety, eligibility, score: scoreOpportunity(opp, profile, eligibility) }

    if (safety.level === 'scam') blocked.push(item)
    else matches.push(item)
  }

  matches.sort((a, b) => b.score - a.score)
  return { matches, blocked }
}

// Short reasons for "Why this suits you"
export function whyItSuits(opp, profile, eligibility) {
  const reasons = []
  const common = opp.interests.filter((i) => profile.interests.includes(i))
  if (common.length) reasons.push({ key: 'whyInterest', params: { interests: common } })
  if (eligibility.eligible) reasons.push({ key: 'whyEligible' })
  if (opp.remote) reasons.push({ key: 'whyRemote' })
  if (opp.travelSupport) reasons.push({ key: 'whyTravel' })
  if (opp.monthlyValue >= 5000) reasons.push({ key: 'whyPaid' })
  return reasons
}
