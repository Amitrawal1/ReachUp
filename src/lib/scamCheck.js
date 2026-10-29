// Simple rule-based scam check.
// Each rule looks for one common warning sign in fake job posts.
// Later this can be replaced with an ML model, but these rules already catch most fake offers.

// Words that fake posts use to rush or trick students
// \b means "whole word only", so "learn" does not match "earn"
const PRESSURE_WORDS = /\b(hurry|limited seats|guaranteed|no exam|direct joining|earn|no experience needed)\b/

export function scamCheck(opp) {
  const flags = []

  // 1. Real employers never ask students to pay to apply
  if (opp.feeRequired) flags.push('asksFee')

  // 2. We could not trace where the listing came from
  if (opp.source.kind === 'unknown') flags.push('unknownSource')

  // 3. Only a personal WhatsApp or phone number, no official website
  if (opp.contactOnly) flags.push('personalContact')

  // 4. Very high pay for a job that needs no qualification
  const needsNoQualification = opp.eligibility.education?.includes('class10')
  if (opp.monthlyValue >= 25000 && needsNoQualification) flags.push('tooGoodToBeTrue')

  // 5. Words that create pressure or promise a sure job
  const text = (opp.title.en + ' ' + opp.summary.en).toLowerCase()
  if (PRESSURE_WORDS.test(text)) flags.push('pressureWords')

  // 2 or more warning signs = very likely a scam
  let level = 'verified'
  if (flags.length >= 2) level = 'scam'
  else if (flags.length === 1) level = 'caution'

  return { level, flags }
}
