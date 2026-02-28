const { Panchang } = require('./panchang.js');
const p = new Panchang();
try {
  console.log("Testing calculate...");
  p.calculate(new Date());
  
  console.log("Testing findNextOccurrence...");
  p.findNextOccurrence("ഏകാദശി");

  console.log("Testing findNextSpecialEvent...");
  p.findNextSpecialEvent();

  console.log("Testing findUpcomingEvents...");
  p.findUpcomingEvents(new Date(), 2);

  console.log("Testing findNextNakshatra...");
  p.findNextNakshatra("അശ്വതി");

  console.log("Testing kollamToGregorian...");
  p.kollamToGregorian(1201, "മകരം", 15);

  console.log("ALL TESTS PASSED.");
} catch (e) {
  console.error("ERROR:", e);
}
