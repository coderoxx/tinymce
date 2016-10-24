define(
  'ephox.alloy.menu.grid.GridConfig',

  [
    'ephox.alloy.alien.ComponentStructure',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.menu.logic.HotspotViews',
    'ephox.alloy.menu.util.MenuMarkers',
    'ephox.alloy.sandbox.Manager',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Insert'
  ],

  function (ComponentStructure, SystemEvents, EventHandler, HotspotViews, MenuMarkers, Manager, FieldPresence, FieldSchema, Objects, ValueSchema, Merger, Option, Cell, Body, Insert) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('lazyHotspot'),

      FieldSchema.strict('onOpen'),
      FieldSchema.strict('onClose'),
      FieldSchema.strict('onExecute'),

      FieldSchema.strict('sink'),
      FieldSchema.strict('flat'),

      FieldSchema.field(
        'markers',
        'markers',
        FieldPresence.strict(),
        MenuMarkers.itemSchema()
      ),

      FieldSchema.field(
        'members',
        'members',
        FieldPresence.strict(),
        ValueSchema.objOf([
          FieldSchema.strict('grid'),
          FieldSchema.strict('item')
        ])
      )
    ]);

    return function (rawUiSpec) {
      var uiSpec = ValueSchema.asStructOrDie('GridConfig', schema, rawUiSpec);

      var state = Cell(Option.none());

      var build = function (sandbox, data) {
        var container = Merger.deepMerge(
          uiSpec.members().grid().munge(rawUiSpec),
          {
            // Always flatgrid.
            uiType: uiSpec.flat() ? 'flatgrid' : 'flatgrid',
            items: data,
            // markers: rawUiSpec.markers,
            members: {
              item: uiSpec.members().item()
            },
            markers: {
              item: uiSpec.markers().item(),
              selectedItem: uiSpec.markers().selectedItem()
            }
          }
        );

        return sandbox.getSystem().build(container);
      };

      var populate = function (sandbox, data) {
        var container = build(sandbox, data);
        sandbox.getSystem().addToWorld(container);
        if (! Body.inBody(container.element())) Insert.append(sandbox.element(), container.element());
        state.set(Option.some(container));
        return state;
      };

      var show = function (sandbox, container) {
        uiSpec.sink().apis().position({
          anchor: 'hotspot',
          hotspot: uiSpec.lazyHotspot()(),
          bubble: Option.none()
        }, container);

        sandbox.apis().setGridSize(2, 2);

        uiSpec.onOpen()(sandbox, container);
      };

      var enter = function (sandbox, state) {
        state.get().each(function (container) {
          show(sandbox, container);
          sandbox.apis().focusIn();
        });
      };

      var preview = function (sandbox, state) {
        state.get().each(function (container) {
          show(sandbox, container);
        });
      };

      var clear = function (sandbox, state) {
        state.get().each(function (container) {
          sandbox.getSystem().removeFromWorld(container);
        });
        state.set(Option.none());
      };

      var isPartOf = function (sandbox, state, queryElem) {
        return state.get().exists(function (container) {
          return ComponentStructure.isPartOf(container, queryElem);
        });
      };

      var events = Objects.wrapAll([
        {
          key: SystemEvents.execute(),
          value: EventHandler.nu({
            run: function (sandbox, simulatedEvent) {
              // Trigger on execute on the targeted element
              // I.e. clicking on menu item
              var target = simulatedEvent.event().target();
              return sandbox.getSystem().getByDom(target).bind(function (item) {
                return uiSpec.onExecute()(sandbox, item);
              });
            }
          })
        }
      ]);

      return {
        sandboxing: {
          manager: Manager.contract({
            clear: clear,
            isPartOf: isPartOf,
            populate: populate,
            preview: preview,
            enter: enter
          }),
          onClose: uiSpec.onClose(),
          sink: uiSpec.sink()
        },
        keying: {
          mode: 'flatgrid',
          onEscape: function (sandbox, simulatedEvent) {
            return HotspotViews.onEscape(uiSpec.lazyHotspot()(), sandbox);
          },
          selector:  '.' + uiSpec.markers().item(),
          captureTab: true
        },
        events: events
      };
    };
  }
);