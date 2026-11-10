export const validEnglandCarrierRegistrationNumbers = [
  'CBDL999',
  'CBDL9999',
  'CBDL99999',
  'CBDL999999',
  'CBDL99999999999999999999',
  'CBDU999',
  'CBDU9999',
  'CBDU99999',
  'CBDU99999999999999999999'
]

export const validSepaCarrierRegistrationNumbers = [
  'EAS/R/999999',
  'EAS/R/9999999',
  'EAS/R/527839',
  'EAS/R/6102309',
  'WCR/R/9999999',
  'SCO/999999',
  'SEA/999999',
  'SNO/999999',
  'SWE/999999',
  'SCO/999999/B',
  'SCO/999999/CB',
  'SEA/999999/CB',
  'SNO/999999/CB',
  'SWE/999999/CB',
  'WCR/999999',
  'WCR/ZZZZZZ',
  'WCR/02bd5f',
  'PCT-A-999',
  'PCT-B-9999',
  'PCT-C-99999',
  'PCT-D-999999',
  'PCT-E-9999999'
]

export const validNrwCarrierRegistrationNumbers =
  validEnglandCarrierRegistrationNumbers

export const validNiCarrierRegistrationNumbers = [
  'ROC UT 9',
  'ROC UT 99',
  'ROC UT 999',
  'ROC UT 9999',
  'ROC UT 99999',
  'ROC LT 9',
  'ROC LT 99',
  'ROC LT 999',
  'ROC LT 9999',
  'ROC LT 99999'
]

export const validCarrierRegistrationNumbers = [
  ...new Set([
    ...validEnglandCarrierRegistrationNumbers,
    ...validSepaCarrierRegistrationNumbers,
    ...validNrwCarrierRegistrationNumbers,
    ...validNiCarrierRegistrationNumbers
  ])
]

export const invalidCarrierRegistrationNumbers = [
  'CBD999',
  'CBDT999',
  'CBDL99',
  'CBDU99',
  'EAS/R/99999',
  'EAS/R/99999999',
  'EAS/P/9999999',
  'WCR/R/999999',
  'WCR/R/99999999',
  'WCR/02bd5',
  'WCR/02bd5f1',
  'WCR/02b-5f',
  'SCO/99999',
  'SCO/9999999',
  'SCO/99999/CB',
  'SCO/999999/X',
  'SCO/999999/CBB',
  'SEA/999999/B',
  'SC/999999',
  'SCD/999999',
  'ROC U 9',
  'ROC L 9',
  'ROC DT 9',
  'ROC UT 999999',
  'ROC LT 999999',
  '   ',
  ' CBDL999 ',
  'PCT-2-9999999',
  'PCT-E-999999A'
]
