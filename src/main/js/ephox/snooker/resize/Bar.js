define(
  'ephox.snooker.resize.Bar',

  [
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.node.Element'
  ],

  function (Attr, Css, Element) {
    var col = function (column, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x - w/2 + 'px',
        top: y + 'px',
        height: h + 'px',
        width: w + 'px'
      });

      Attr.set(blocker, 'data-column', column);
      Attr.set(blocker, 'data-mce-bogus', 'all');
      return blocker;
    };

    var row = function (row, x, y, w, h) {
      var blocker = Element.fromTag('div');
      Css.setAll(blocker, {
        position: 'absolute',
        left: x + 'px',
        top: y - h/2 + 'px',
        height: h + 'px',
        width: w + 'px'
      });

      Attr.set(blocker, 'data-row', row);
      Attr.set(blocker, 'data-mce-bogus', 'all');
      return blocker;
    };


    return {
      col: col,
      row: row
    };
  }
);
