///<reference path="../testReference.ts" />

describe("Plots", () => {
  describe("Waterfall", () => {
    describe("rendering growth bars", () => {
      let numAttr = TestMethods.numAttr;
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let growthBarData = [
        { x: "A", y: 0 },
        { x: "B", y: 5 },
        { x: "C", y: 10 },
        { x: "D", y: 100}
      ];

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dataset = new Plottable.Dataset(growthBarData);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d, i) => i === 0);
        plot.addDataset(dataset);
        plot.renderTo(svg);
      });

      it("classes growth bars", () => {
        let bars = plot.content().selectAll("rect");
        assert.strictEqual(bars.size(), growthBarData.length, "all bars are growth except for first");
        bars.each(function(d, i) {
          if (i === 0) {
            return;
          }
          let bar = d3.select(this);
          assert.isTrue(bar.classed("waterfall-growth"), "bar classed as growth bar");
        });
        plot.destroy();
        svg.remove();
      });

      it("bars placed at current sum", () => {
        let bars = plot.content().selectAll("rect.waterfall-growth");
        assert.strictEqual(bars.size(), growthBarData.length - 1, "all bars are growth except for first");
        let yAccessor = plot.y().accessor;
        let sum = 0;
        bars.each(function(d, i) {
          let dataY = yAccessor(d, i, dataset);
          let bar = d3.select(this);
          assert.closeTo(numAttr(bar, "y") + numAttr(bar, "height"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar top at final sum");
          sum += dataY;
          assert.closeTo(numAttr(bar, "y"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar bottom at previous sum");
        });

        plot.destroy();
        svg.remove();
      });
    });

    describe("rendering decline bars", () => {
      let numAttr = TestMethods.numAttr;
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let declineBarData = [
        { x: "A", y: 0 },
        { x: "B", y: -5 },
        { x: "C", y: -25 },
        { x: "D", y: -10 },
        { x: "E", y: -15 }
      ];

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dataset = new Plottable.Dataset(declineBarData);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d, i) => i === 0);
        plot.addDataset(dataset);
        plot.renderTo(svg);
      });

      it("classes decline bars", () => {
        let bars = plot.content().selectAll("rect");
        assert.strictEqual(bars.size(), declineBarData.length, "all bars are growth except for first");
        bars.each(function(d, i) {
          if (i === 0) {
            return;
          }
          let bar = d3.select(this);
          assert.isTrue(bar.classed("waterfall-decline"), "bar classed as growth bar");
        });
        plot.destroy();
        svg.remove();
      });

      it("bars placed at current sum", () => {
        let bars = plot.content().selectAll("rect.waterfall-decline");
        assert.strictEqual(bars.size(), declineBarData.length - 1, "all bars are decline except for first");
        let yAccessor = plot.y().accessor;
        let sum = 0;
        bars.each(function(d, i) {
          let dataY = yAccessor(d, i, dataset);
          let bar = d3.select(this);
          assert.closeTo(numAttr(bar, "y"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar top at previous sum");
          sum += dataY;
          assert.closeTo(numAttr(bar, "y") + numAttr(bar, "height"), yScale.scale(sum),
            window.Pixel_CloseTo_Requirement, "growth bar bottom at final sum");
        });

        plot.destroy();
        svg.remove();
      });
    });

    describe("denoting total bars", () => {
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let data = [
        { x: "A", y: 20, t: true },
        { x: "B", y: 5, t: false },
        { x: "C", y: 25, t: true },
        { x: "D", y: -10, t: false },
        { x: "E", y: 15, t: true }
      ];

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
      });

      it("can set the total property", () => {
        let accessor = (d: any) => d.t;
        assert.strictEqual(plot.total(accessor), plot, "setter returns calling object");

        plot.addDataset(dataset);
        plot.renderTo(svg);
        let bars = plot.content().selectAll("rect");
        let totalBarIndices = data.map((d, i) => i).filter((index) => accessor(data[index]));
        totalBarIndices.forEach((totalBarIndex) => {
          let totalBar = d3.select(bars[0][totalBarIndex]);
          assert.isTrue(totalBar.classed("waterfall-total"));
        });
        plot.destroy();
        svg.remove();
      });

      it("can get the total property", () => {
        let accessor = (d: any) => d.t === "total";
        plot.total(accessor);
        assert.strictEqual(plot.total().accessor, accessor, "can get if connectors are enabled");
        plot.destroy();
        svg.remove();
      });
    });

    describe("enabling connectors", () => {
      let numAttr = TestMethods.numAttr;
      let svg: d3.Selection<void>;
      let dataset: Plottable.Dataset;
      let xScale: Plottable.Scales.Category;
      let yScale: Plottable.Scales.Linear;
      let plot: Plottable.Plots.Waterfall<string, number>;
      let SVG_WIDTH = 600;
      let SVG_HEIGHT = 400;
      let data = [
        { x: "A", y: 20, t: true },
        { x: "B", y: 5, t: false },
        { x: "C", y: 25, t: true },
        { x: "D", y: -10, t: false },
        { x: "E", y: 15, t: true }
      ];

      beforeEach(() => {
        svg = TestMethods.generateSVG(SVG_WIDTH, SVG_HEIGHT);
        dataset = new Plottable.Dataset(data);
        xScale = new Plottable.Scales.Category();
        yScale = new Plottable.Scales.Linear();
        plot = new Plottable.Plots.Waterfall<string, number>();
        plot.x((d) => d.x, xScale);
        plot.y((d) => d.y, yScale);
        plot.total((d) => d.t);
        plot.addDataset(dataset);
      });

      it("does not have connectors enabled by default", () => {
        assert.isFalse(plot.connectorsEnabled(), "no connectors by default");
        plot.destroy();
        svg.remove();
      });

      it("can set if connectors are enabled", () => {
        assert.strictEqual(plot.connectorsEnabled(true), plot, "setter returns calling object");
        plot.renderTo(svg);
        let bars = plot.content().selectAll("rect");
        let connectors = plot.content().selectAll("line.connector");
        assert.strictEqual(bars.size(), connectors.size() + 1, "there is one more bar than number of connectors");
        connectors.each(function(datum, index) {
          let connector = d3.select(this);
          let bar = d3.select(bars[0][index]);
          let connectorOnBottom = bar.classed("waterfall-decline");
          if (connectorOnBottom) {
            assert.closeTo(numAttr(connector, "y1"), numAttr(bar, "y") + numAttr(bar, "height"),
              window.Pixel_CloseTo_Requirement, "connector on declining bar at bottom");
          } else {
            assert.closeTo(numAttr(connector, "y1"), numAttr(bar, "y"),
              window.Pixel_CloseTo_Requirement, "connector on non-declining bar at top");
          }
          assert.strictEqual(numAttr(connector, "y1"), numAttr(connector, "y2"), "connector stays at same height");
        });
        plot.destroy();
        svg.remove();
      });

      it("can get if connectors are enabled", () => {
        let connectorsEnabled = true;
        plot.connectorsEnabled(connectorsEnabled);
        assert.strictEqual(plot.connectorsEnabled(), connectorsEnabled, "can get if connectors are enabled");
        plot.destroy();
        svg.remove();
      });
    });

  });
});
