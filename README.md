# malayalam-panchangam

Malayalam Panchangam (പഞ്ചാംഗം) calculator for Node.js. Computes Nakshatra, Tithi, Yoga, Karana, Rashi, sunrise/sunset, and Malayalam (Kollam Era) calendar dates using accurate astronomical algorithms.

Zero dependencies. Works in Node.js and the browser.

## Install

```bash
npm install malayalam-panchangam
```

## Usage

```js
const panchang = require('malayalam-panchangam');
const Panchang = panchang.Panchang;
```

### calculate(date, options?)

Compute full panchangam for a given date.

```js
const p = new Panchang();
const result = p.calculate(new Date());

console.log(result.nakshatra.name);   // e.g. "രോഹിണി"
console.log(result.tithi.name);       // e.g. "ഏകാദശി"
console.log(result.yoga.name);        // e.g. "സിദ്ധി"
console.log(result.Malayalam);        // Malayalam date details
```

You can pass coordinates for location-specific sunrise/sunset:

```js
const result = p.calculate(new Date(), { lat: 10.85, lon: 76.27 }); // Thrissur
console.log(result.SunTimes);
```

### findNextNakshatra(name, startDate?)

Find the next occurrence of a specific nakshatra.

```js
const p = new Panchang();
const next = p.findNextNakshatra('തിരുവോണം');
console.log(next); // { date, nakshatra }
```

### kollamToGregorian(year, month, day)

Convert a Kollam Era date to Gregorian.

```js
const p = new Panchang();
const gregorian = p.kollamToGregorian(1201, 'ചിങ്ങം', 1);
console.log(gregorian);
```

### getNakshatras()

Get the list of all 27 nakshatras.

```js
const p = new Panchang();
console.log(p.getNakshatras());
// ["അശ്വതി", "ഭരണി", "കാർത്തിക", ...]
```

### findUpcomingEvents(startDate?, limit?)

Find upcoming Hindu calendar events/visheshams.

```js
const p = new Panchang();
const events = p.findUpcomingEvents(new Date(), 10);
events.forEach(e => console.log(e));
```

### Legacy API

The module also supports a legacy callback-style API:

```js
const panchang = require('malayalam-panchangam');
panchang.calculate(new Date(), () => {
  console.log(panchang.Nakshatra);
  console.log(panchang.Tithi);
  console.log(panchang.Malayalam);
});
```

## License

MIT
