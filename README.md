# Spidy

Spidy lets you extract a lot of useful data of a website with fancy and easy reports based on scores. So what we could extract?

At this version its able to extract:

- links
- responses
- images
- metadata
- server info
- stylesheets
- scripts
- commentaries

With the grabbed data spidy build reports with scores to make suggestions and point to the weaknesses of that website or SPA.

## How it works

Since the new web technologies arose make a simple request its not enough because big percentage
of the request are XHR (asynchronus), also called AJAX requests, and the recents technologies like single web appplications (SPA) are based on that technology to make the user experience
more easy and dynamic.

The bad side is we could only grab a little portion of the data if we use only a plain request because we will lose the rest of the XHR launched when the page loads. So the right way
to do so is using a headless browser to automate this process.

## Quick setup

1. Install nodejs
2. [Download](https://github.com/romanarranz/spidy/archive/master.zip) this repo, or `git clone https://github.com/romanarranz/spidy.git`
3. `cd spidy`
4. `npm install` to install dependencies
5. Launch

Example

```
$ mkdir output
$ node index.js -f output/9gag.json http://www.9gag.com
```

## TODO

- better and comprehensive reports with descriptions and suggestions
- evaluate images
- evaluate texts and backgroundsu to check readability
- evaluate each file and metadata
- check dns lookups
- report the dns traces
- check cacheable methods
- waterfall pdf of the loadeds resouces like images
- evaluate the performance and requests time with differents speeds simulating 3g/4g
- evaluate if its a progressive web app

## License

The MIT License (MIT). Please see [License File](./LICENSE.md) for more information.
