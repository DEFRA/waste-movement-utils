// Operators that qualify a Haz/POPs component concentration, allowing a waste
// receiver to record that a value is above or below a threshold when a precise
// measurement is not available, e.g. "> 10" mg per kg.
//
// The symbols are the values submitted to, and stored by, the API because they
// are what the published guidance tells waste receivers to use.
export const concentrationOperators = {
  GREATER_THAN: '>',
  LESS_THAN: '<'
}
