/**
 * d3-simple-gauge.js | MIT license
 *
 * The code is based on this example (https://codepen.io/anon/pen/WKyXgr)
 * on CodePen and on this tutorial (https://jaketrent.com/post/rotate-gauge-needle-in-d3/).
 *
 * I refactored the code of the example to make it work with D3.js v5, and I restructured
 * the code to make it more flexible.
 *
 * Thanks to the original author for its work.
 */

import * as d3 from 'd3';
import 'd3-transition';
import { arc as d3Arc } from 'd3-shape';
import { easeElastic } from 'd3-ease';
import { range } from 'd3-array';
import { scaleLinear } from 'd3-scale';
import { select } from 'd3-selection';
import $ from 'jquery';

const Gauge = ($ => {
  const NAME = 'gauge';
  const version = '0.0.1';
  const JQUERY_NO_CONFLICT = $.fn[NAME];
  const DATA_KEY = 'initGauge';

  const CONSTANTS = {
    BAR_WIDTH: 40,
    CHAR_INSET: 10,
    EASE_TYPE: easeElastic,
    NEEDLE_ANIMATION_DELAY: 0,
    NEEDLE_ANIMATION_DURATION: 3000,
    NEEDLE_RADIUS: 15,
    PAD_RAD: 0.05,
    SECTIONS_GAP: 0
  };

  const percToDeg = perc => perc * 360;
  const degToRad = deg => (deg * Math.PI) / 180;
  const percToRad = perc => degToRad(percToDeg(perc));

  /**
   * Defines the needle used in the gauge.
   */
  class Needle {
    /**
     * Initializes a new instance of the Needle class.
     *
     * @param config                      The configuration to use to initialize the needle.
     * @param config.animationDelay       The delay in ms before to start the needle animation.
     * @param config.animationDuration    The duration in ms of the needle animation.
     * @param config.color                The color to use for the needle.
     * @param config.easeType             The ease type to use for the needle animation.
     * @param config.el                   The parent element of the needle.
     * @param config.length               The length of the needle.
     * @param config.percent              The initial percentage to use.
     * @param config.radius               The radius of the needle.
     * @param config.needleWidth          The half bottom width of the needle
     * @param config.needleLength         The length of the needle
     * @param config.gradientChange       The gradient color will rotate with the needle
     */
    constructor(config) {
      this._animationDelay = config.animationDelay;
      this._animationDuration = config.animationDuration;
      this._color = config.color;
      this._easeType = config.easeType;
      this._el = config.el;
      this._length = config.length;
      this._percent = config.percent;
      this._radius = config.radius;
      this._needleWidth = config.needleWidth;
      this._needleLength = config.needleLength;
      this._gradientChange = config.gradientChange;
      this._initialize();
    }

    /**
     * Updates the needle position based on the percentage specified.
     *
     * @param percent      The percentage to use.
     */
    update(percent) {
      const self = this;
      this._el.transition()
        .delay(this._animationDelay)
        .ease(this._easeType)
        .duration(this._animationDuration)
        .selectAll('.needle')
        .tween('progress', function () {
          const thisElement = this;
          const delta = percent - self._percent;
          const initialPercent = self._percent;
          return function (progressPercent) {
            self._percent = initialPercent + progressPercent * delta;
            return select(thisElement)
              .attr('d', self._getPath(self._percent));
          }
        });
    }

    /**
     * Initializes the needle.
     *
     * @private
     */
    _initialize() {
      this._el.append('circle')
        .attr('class', 'needle-center')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', 0);

      if (this._gradientChange) {
          this._el.append('path').attr('class', 'needle')
          .attr('d', this._getPath(this._needleWidth, this._needleLength))
          .attr('transform', 'rotate(-90)')
          .transition().delay(this._animationDelay).duration(this._animationDuration)
          .attr('transform', this._getRotate(this._percent));
      } else {
          this._el.append('path').attr('class', 'needle')
          .attr('d', this._getPath(this._needleWidth, this._needleLength))
          .attr('transform', 'rotate(-90)')
          .transition().delay(this._animationDelay).ease(this._easeType).duration(this._animationDuration)
          .attr('transform', this._getRotate(this._percent));
      }

      if (this._color) {
        this._el.select('.needle-center')
          .style('fill', this._color);

        this._el.select('.needle')
          .style('fill', this._color);
      }
    }

    /**
     * Gets the needle path based on the percent specified.
     *
     * @param percent       The percentage to use to create the path.
     * @returns {string}    A string associated with the path.
     * @private
     */
    _getPath(needleWidth, needleLength) {
      return 'M ' + (-1 * needleWidth) + ' ' + 0 + ' L ' + needleWidth + ' ' + 0 + ' L ' + (needleWidth / 2) + ' ' + (-1 * needleLength) + ' L ' + ( -1 * needleWidth / 2) + ' ' + (-1 * needleLength);
    }

    _getRotate(percent) {
        const halfPI = Math.PI / 2;
        const thetaRad = percToRad(percent / 2);
        const rotate = (thetaRad - halfPI) * 180 / Math.PI;

        return 'rotate(' + rotate + ')';
    }
  }

  /**
   * Defines a simple gauge.
   */
  class Gauge {
    /**
     * Initializes a new instance of the SimpleGauge class.
     *
     * @param config                        The configuration to use to initialize the gauge.
     * @param [config.animationDelay]       The delay in ms before to start the needle animation. By default, the value
     *                                      is 0.
     * @param [config.animationDuration]    The duration in ms of the needle animation. By default, the value is 3000.
     * @param [config.barWidth]             The bar width of the gauge. By default, the value is 40.
     * @param [config.chartInset]           The char inset to use. By default, the value is 10.
     * @param [config.easeType]             The ease type to use for the needle animation. By default, the value is
     *                                      "d3.easeElastic".
     * @param config.el                     The D3 element to use to create the gauge (must be a group or an SVG element).
     * @param config.height                 The height of the gauge.
     * @param [config.interval]             The interval (min and max values) of the gauge. By default, the interval
     *                                      ia [0, 1].
     * @param [config.needleColor]          The needle color.
     * @param [config.needleRadius]         The radius of the needle. By default, the radius is 15.
     * @param [config.percent]              The percentage to use for the needle position. By default, the value is 0.
     * @param config.sectionsCount          The number of sections in the gauge.
     * @param [config.sectionsColors]       The color to use for each section.
     * @param config.width                  The width of the gauge.
     * @param config.sectionsGap             The gap between each section.
     * @param [config.sectionsPercentages]  The percentage that each section take.
     * @param config.needleWidth            The half bottom width of the needle.
     * @param config.needleLength           The length of the needle.
     * @param [config.barLabels]            The labels of the gauge.
     * @param config.labelsColor            The color of the labels of the gauge.
     * @param [config.labelsLocations]      The location of the labels of the gauge.
     * @param config.gradientChange         The gradient color will rotate with the needle.
     */
    constructor(element, config) {
      this._element = element;
      if (!config.el) {
        throw new Error('The element must be valid.');
      }
      if (!config.chartId) {
        throw new RangeError('The chartId must be valid');
      }
      if (!config.svgId) {
        throw new RangeError('The svgId must be valid');
      }
      if (isNaN(config.height) || config.height <= 0) {
        throw new RangeError('The height must be a positive number.');
      }
      if (isNaN(config.sectionsCount) || config.sectionsCount <= 0) {
        throw new RangeError('The sections count must be a positive number.');
      }
      if (isNaN(config.width) || config.width <= 0) {
        throw new RangeError('The width must be a positive number.');
      }
      if (config.animationDelay !== undefined && (isNaN(config.animationDelay)
        || config.animationDelay < 0)) {
        throw new RangeError('The transition delay must be greater or equal to 0.');
      }
      if (config.animationDuration !== undefined && (isNaN(config.animationDuration)
        || config.animationDuration < 0)) {
        throw new RangeError('The transition duration must be greater or equal to 0.');
      }
      if (config.barWidth !== undefined && (isNaN(config.barWidth) || config.barWidth <= 0)) {
        throw new RangeError('The bar width must be a positive number.');
      }
      if (config.percent !== undefined && (isNaN(config.percent) || config.percent <= 0)) {
        throw new RangeError('The bar width must be a positive number.');
      }
      if (config.chartInset !== undefined && (isNaN(config.chartInset) || config.chartInset < 0)) {
        throw new RangeError('The chart inset must be greater or equal to 0.');
      }
      if (config.needleRadius !== undefined && (isNaN(config.needleRadius) || config.needleRadius < 0)) {
        throw new RangeError('The needle radius must be greater or equal to 0.');
      }
      if (config.sectionsColors !== undefined && config.sectionsColors.length !== config.sectionsCount) {
        throw new RangeError('The sectionsColors length must match with the sectionsCount.');
      }
      if (config.sectionsPercentages !== undefined && config.sectionsPercentages.length !== config.sectionsCount) {
        throw new RangeError('The sectionsPercentages length must match with the sectionsCount.');
      }
      if (config.needleLength !== undefined && (isNaN(config.needleLength) || config.needleLength <= 0)) {
        throw new RangeError('The length of the needle must be a positive number.');
      }
      if (config.needleWidth !== undefined && (isNaN(config.needleWidth) || config.needleWidth <= 0)) {
        throw new RangeError('The half bottom width of the needle must be a positive number.');
      }
      if (config.barLabels && config.labelsLocations && config.barLabels.length !== config.labelsLocations.length) {
        throw new RangeError('The barLabels length must match with the labelsLocations length');
      }

      this._animationDelay = (config.animationDelay !== undefined)
        ? config.animationDelay
        : CONSTANTS.NEEDLE_ANIMATION_DELAY;

      this._animationDuration = (config.animationDuration !== undefined)
        ? config.animationDuration
        : CONSTANTS.NEEDLE_ANIMATION_DURATION;

      this._chartInset = (config.chartInset !== undefined)
        ? config.chartInset
        : CONSTANTS.CHAR_INSET;

      this._chartId = config.chartId;
      this._svgId = config.svgId;
      this._animationDelay = config.animationDelay !== undefined ? config.animationDelay : CONSTANTS.NEEDLE_ANIMATION_DELAY;

      this._animationDuration = config.animationDuration !== undefined ? config.animationDuration : CONSTANTS.NEEDLE_ANIMATION_DURATION;

      this._chartInset = config.chartInset !== undefined ? config.chartInset : CONSTANTS.CHAR_INSET;

      this._barWidth = config.barWidth || CONSTANTS.BAR_WIDTH;
      this._easeType = config.easeType || CONSTANTS.EASE_TYPE;
      this._el = config.el;
      this._height = config.height;
      this._needleRadius = config.needleRadius !== undefined ? config.needleRadius : CONSTANTS.NEEDLE_RADIUS;
      this._sectionsCount = config.sectionsCount;
      this._width = config.width;
      this._sectionsColors = config.sectionsColors;
      this._needleColor = config.needleColor;
      this._sectionsGap = config.sectionsGap;
      this._sectionsPercentages = config.sectionsPercentages;
      this._needleLength = config.needleLength;
      this._barLabels = config.barLabels;
      this._labelsColor = config.labelsColor;
      this._labelsLocations = config.labelsLocations;
      this._needleWidth = config.needleWidth;
      this._gradientChange = config.gradientChange;

      this.interval = config.interval || [0, 1];
      this.percent = config.percent !== undefined ? config.percent : 0;

      this._initialize();
    }

    static get VERSION() {
      return VERSION
    }

    /**
     * Gets the interval of the gauge.
     *
     * @returns {Array}   An array of two elements that represents the min and the max values of the gauge.
     */
    get interval() {
      return this._scale.domain();
    }

    /**
     * Sets the interval of the gauge (min and max values).
     *
     * @param interval
     */
    set interval(interval) {
      if (!(interval instanceof Array) || interval.length !== 2 ||
        isNaN(interval[0]) ||isNaN(interval[1]) || interval[0] > interval[1]) {
        throw new Error('The interval specified is invalid.');
      }
      this._scale = scaleLinear()
        .domain(interval)
        .range([0, 1])
        .clamp(true);
    }

    /**
     * Gets the needle percent.
     *
     * @returns {number|*}    The percentage position of the needle.
     */
    get percent() {
      return this._percent;
    }

    /**
     * Sets the needle percent. The percent must be between 0 and 1.
     *
     * @param percent         The percentage to set.
     */
    set percent(percent) {
      if (isNaN(percent) || percent < 0 || percent > 1) {
        throw new RangeError('The percentage must be between 0 and 1.');
      }
      if (this._needle) {
        this._needle.update(percent);
      }
      this._percent = percent;
      this._update();
    }

    /**
     * Sets the needle position based on the specified value inside the interval.
     * If the value specified is outside the interval, the value will be
     * clamped to fit inside the domain.
     *
     * @param value           The value to use to set the needle position.
     */
    set value(value) {
      if (isNaN(value)) {
        throw new Error('The specified value must be a number.');
      }
      this.percent = this._scale(value);
    }

    /**
     * Initializes the simple gauge.
     *
     * @private
     */
    _initialize() {
      const sectionPercentage = 1 / this._sectionsCount / 2;
      const padRad = CONSTANTS.PAD_RAD;

      let totalPercent = 0.75; // Start at 270deg
      const radius = Math.min(this._width, this._height * 2) / 2;

      if (this._needleLength > this._width / 2 && this._needleLength > this._height) {
          this._chart = this._el.append('g')
          .attr('transform', 'translate(' + (this._width / 2 + (this._needleLength - this._width / 2)) + ', ' + (this._height + (this._needleLength - this._height)) + ')');
      } else if (this._needleLength > this._width / 2 && this._needleLength <= this._height) {
          this._chart = this._el.append('g')
          .attr('transform', 'translate(' + (this._width / 2 + (this._needleLength - this._width)) + ', ' + this._height + ')');
      } else if (this._needleLength <= this._width / 2 && this._needleLength > this._height) {
          this._chart = this._el.append('g')
          .attr('transform', 'translate(' + this._width / 2 + ', ' + (this._height + (this._needleLength - this._height)) + ')');
      } else {
          this._chart = this._el.append('g')
          .attr('transform', 'translate(' + this._width / 2 + ', ' + this._height + ')');
      }

      if (this._gradientChange) {
          const arc = d3.arc()
          .innerRadius(radius - this._chartInset - this._barWidth)
          .outerRadius(radius - this._chartInset)
          .startAngle(-0.5 * Math.PI);

          const background = this._chart.append("path")
          .datum({endAngle: 0.5 * Math.PI})
          .style("fill", "#F5F5F5")
          .attr("d", arc);

          let foreground = this._chart.append("path")
          .style("fill", () => {
              const colors = this._sectionsColors[0];
              const defs = this._el.append('defs');
              const linearGradient = defs.append('linearGradient').attr('id', 'section-color-' + this._chartId)
              .attr('x1', '0%').attr('y1', '100%').attr('x2', '100%').attr('y2', '0%');

              linearGradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:' + colors[0] + ';stop-opacity:1');
              linearGradient.append('stop').attr('offset', '100%').attr('style', 'stop-color:' + colors[1] + ';stop-opacity:1');

              return 'url(' + window.location.pathname + '#section-color-' + this._chartId + ')';
          })
          .datum({endAngle: -0.5 * Math.PI})
          .attr("d", arc);

          foreground.transition()
          .delay(this._animationDelay)
          .duration(this._animationDuration)
          .attrTween("d", arcTween((this._percent - 0.5) * Math.PI));

          function arcTween(newAngle) {
              return function (d) {
                  const interpolate = d3.interpolate(d.endAngle, newAngle);
                  return function (t) {
                      d.endAngle = interpolate(t);
                      return arc(d);
                  };
              };
          }
      } else {
          this._arcs = this._chart.selectAll('.arc')
          .data(range(1, this._sectionsCount + 1))
          .enter()
          .append('path')
          .attr('class', sectionIndex => `arc chart-color${sectionIndex}`)
          .attr('d', sectionIndex => {
              const sectionPercentage = 1 / 2 * this._sectionsPercentages[sectionIndex - 1];
              const arcStartRad = percToRad(totalPercent);
              const arcEndRad = arcStartRad + percToRad(sectionPercentage);
              totalPercent += sectionPercentage;

              if (!this._sectionsGap) {
                this._sectionsGap = CONSTANTS.SECTIONS_GAP;
              }
              const startPadRad = sectionIndex === 0 ? 0 : this._sectionsGap / 2;
              const endPadRad = sectionIndex === this._sectionsCount ? 0 : this._sectionsGap / 2;
              const arc = d3Arc()
              .outerRadius(radius - this._chartInset)
              .innerRadius(radius - this._chartInset - this._barWidth)
              .startAngle(arcStartRad + startPadRad)
              .endAngle(arcEndRad - endPadRad);

              return arc(this);            
          });
          
          /*
              If only one color in the array, then sets one color in the section.
              If more than one color in the array, then sets gradient color in the section.
          */
          if (this._sectionsColors) {
              this._arcs.style('fill', sectionIndex => {
                  if (this._sectionsColors[sectionIndex - 1].length <= 1) {
                      return this._sectionsColors[sectionIndex - 1];
                  } else {
                      const colors = this._sectionsColors[sectionIndex - 1];
                      const defs = this._el.append('defs');
                      const linearGradient = defs.append('linearGradient').attr('id', 'section-color-' + this._chartId)
                      .attr('x1', '0%').attr('y1', '100%').attr('x2', '100%').attr('y2', '0%');

                      linearGradient.append('stop').attr('offset', '0%').attr('style', 'stop-color:' + colors[0] + ';stop-opacity:1');
                      linearGradient.append('stop').attr('offset', '100%').attr('style', 'stop-color:' + colors[1] + ';stop-opacity:1');

                      return 'url(' + window.location.pathname + '#section-color-' + this._chartId + ')';
                  }
              });
          }
      }

      /*
          Set the location of the labels of the guage 
      */
      if (this._barLabels) {
          const locations = this._labelsLocations;
          this._barLabels.forEach((o, p) => {
            let labelX;
            let labelY;
            if (locations && locations.length > 0) {
              labelX = locations[p][0];
              labelY = locations[p][1];
            } else {
              labelX = 0;
              labelY = 0;
            }
            this._chart.append('text').attr('x', labelX).attr('y', labelY).attr('fill', this._labelsColor).attr('style', 'font-size:12px;').html(this._barLabels[p]);
          })
      }

      this._needle = new Needle({
        animationDelay: this._animationDelay,
        animationDuration: this._animationDuration,
        color: this._needleColor,
        easeType: this._easeType,
        el: this._chart,
        length: this._height * 0.5,
        percent: this._percent,
        radius: this._needleRadius,
        needleWidth: this._needleWidth,
        needleLength: this._needleLength,
        gradientChange: this._gradientChange
      });
      this._update();
    }

    /**
    * Updates the active arc and the gauge status (min or max) based on the current percent.
    *
    * @private
    */
    _update() {
      if (!this._arcs) {
        return;
      }
      this._arcs.classed('active', (d, i) => i === Math.floor(this._percent * this._sectionsCount) ||
        i === this._arcs.size() - 1 && this._percent === 1);
      this._chart.classed('min', this._percent === 0);
      this._chart.classed('max', this._percent === 1);
    }

    static _jQueryInterface(_config) {
      return this.each(function () {
        let data = $(this).data(DATA_KEY);

        const config = {
          ...$(this).data,
          ...typeof _config === 'object' && _config ? _config : {}
        }

        if (!data) {
          data = new Gauge(this, config);
          $(this).data(DATA_KEY, data);
          // data.init();
        }
      })
    }
  }

    $.fn[NAME] = Gauge._jQueryInterface
    $.fn[NAME].Constructor = Gauge
    $.fn[NAME].noConflict = function () {
        $.fn[NAME] = JQUERY_NO_CONFLICT
        return Gauge._jQueryInterface
    }


  return Gauge
})($)

export default Gauge