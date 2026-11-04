System.register("chunks:///_virtual/Bullet.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, UITransform, Graphics, Color, Component, getTuning, LEVEL_ROWS, LEVEL_GRID, LEVEL_COLS;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      LEVEL_ROWS = module.LEVEL_ROWS;
      LEVEL_GRID = module.LEVEL_GRID;
      LEVEL_COLS = module.LEVEL_COLS;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "b2c3dTl9qdIkLEjRWeJq83v", "Bullet", undefined);
      var ccclass = _decorator.ccclass;
      var EPS = 1e-4;
      var Bullet = exports('Bullet', (_dec = ccclass('Bullet'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Bullet, _Component);
        function Bullet() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.vx = 0;
          _this.vy = 0;
          _this.life = 0;
          _this._halfW = 1.5;
          _this._halfH = 3;
          return _this;
        }
        var _proto = Bullet.prototype;
        _proto.onLoad = function onLoad() {
          var g = getTuning().gunboots;
          this._halfW = g.bulletWidth / 2;
          this._halfH = g.bulletHeight / 2;
          var ut = this.getComponent(UITransform);
          if (ut) {
            ut.setContentSize(g.bulletWidth, g.bulletHeight);
          }
          this._draw();
        };
        _proto.init = function init(x, y, vx, vy, life) {
          this.vx = vx;
          this.vy = vy;
          this.life = life;
          this.node.setPosition(x, y);
          this.node.active = true;
        }

        /** 由 Gunboots 每步调用；命中或寿命尽时返回 true 表示应回收。 */;
        _proto.step = function step(tileSize) {
          this.life -= 1;
          if (this.life <= 0) {
            return true;
          }
          var x0 = this.node.position.x;
          var y0 = this.node.position.y;
          this.node.setPosition(x0 + this.vx, y0 + this.vy);
          var x = this.node.position.x;
          var y = this.node.position.y;
          if (y > 0 || y < -LEVEL_ROWS * tileSize) {
            return true;
          }
          if (this._hitsSolid(x, y, tileSize)) {
            return true;
          }
          return false;
        };
        _proto._hitsSolid = function _hitsSolid(x, y, tileSize) {
          var left = x - this._halfW;
          var right = x + this._halfW;
          var bottom = y - this._halfH;
          var top = y + this._halfH;
          var col0 = Math.max(0, Math.floor(left / tileSize));
          var col1 = Math.min(LEVEL_COLS - 1, Math.floor((right - EPS) / tileSize));
          var row0 = Math.max(0, Math.floor(-top / tileSize));
          var row1 = Math.min(LEVEL_ROWS - 1, Math.floor((-bottom - EPS) / tileSize));
          for (var row = row0; row <= row1; row++) {
            for (var col = col0; col <= col1; col++) {
              if (LEVEL_GRID[row][col] === 1) {
                return true;
              }
            }
          }
          return false;
        };
        _proto._draw = function _draw() {
          var g = this.getComponent(Graphics);
          var ut = this.getComponent(UITransform);
          if (!g || !ut) {
            return;
          }
          var hw = ut.width / 2;
          var hh = ut.height / 2;
          g.clear();
          g.fillColor = new Color(240, 240, 255, 255);
          g.rect(-hw, -hh, ut.width, ut.height);
          g.fill();
          g.fillColor = new Color(255, 255, 255, 200);
          g.rect(-hw, hh - 2, ut.width, 2);
          g.fill();
        };
        return Bullet;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BulletPool.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Bullet.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, assetManager, Prefab, instantiate, Component, Bullet;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      assetManager = module.assetManager;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      Component = module.Component;
    }, function (module) {
      Bullet = module.Bullet;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "c3d4eX2p7hJAcI0VniQq83v", "BulletPool", undefined);
      var ccclass = _decorator.ccclass;
      var POOL_SIZE = 16;
      var BulletPool = exports('BulletPool', (_dec = ccclass('BulletPool'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(BulletPool, _Component);
        function BulletPool() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._free = [];
          _this._active = [];
          _this._poolWarned = false;
          return _this;
        }
        var _proto = BulletPool.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          var world = find('World');
          if (!world) {
            console.error('[BulletPool] World node not found');
            return;
          }
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[BulletPool] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.load('prefab/Bullet', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[BulletPool] prefab/Bullet load failed');
                return;
              }
              for (var i = 0; i < POOL_SIZE; i += 1) {
                var node = instantiate(prefab);
                world.addChild(node);
                var bullet = node.getComponent(Bullet);
                if (!bullet) {
                  bullet = node.addComponent(Bullet);
                }
                node.active = false;
                _this2._free.push(bullet);
              }
            });
          });
          if (typeof window !== 'undefined') {
            window.__dwBullets = this;
          }
        };
        _proto.spawn = function spawn(x, y, vx, vy, life) {
          var bullet = this._free.pop();
          if (!bullet) {
            if (!this._poolWarned) {
              console.warn('[BulletPool] pool empty');
              this._poolWarned = true;
            }
            return null;
          }
          bullet.init(x, y, vx, vy, life);
          this._active.push(bullet);
          return bullet;
        };
        _proto.recycle = function recycle(b) {
          var idx = this._active.indexOf(b);
          if (idx >= 0) {
            this._active.splice(idx, 1);
          }
          b.node.active = false;
          this._free.push(b);
        }

        /** Gunboots 每步驱动活跃子弹。 */;
        _proto.stepBullets = function stepBullets(tileSize) {
          for (var i = this._active.length - 1; i >= 0; i -= 1) {
            var b = this._active[i];
            if (b.step(tileSize)) {
              this.recycle(b);
            }
          }
        };
        _createClass(BulletPool, [{
          key: "activeCount",
          get: function get() {
            return this._active.length;
          }
        }, {
          key: "activeBullets",
          get: function get() {
            return this._active;
          }
        }]);
        return BulletPool;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ChargeBar.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './Gunboots.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Graphics, UITransform, Color, Component, getTuning, Gunboots;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Graphics = module.Graphics;
      UITransform = module.UITransform;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      Gunboots = module.Gunboots;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "d4e5fanuMlAEtNFZ4kBq83v", "ChargeBar", undefined);
      var ccclass = _decorator.ccclass;
      var CELL_W = 10;
      var CELL_H = 8;
      var CELL_GAP = 2;
      var REDRAW_INTERVAL = 0.1;
      var ChargeBar = exports('ChargeBar', (_dec = ccclass('ChargeBar'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ChargeBar, _Component);
        function ChargeBar() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._accum = 0;
          _this._lastCharge = -1;
          _this._gunboots = null;
          return _this;
        }
        var _proto = ChargeBar.prototype;
        _proto.onLoad = function onLoad() {
          this._redraw();
        };
        _proto.update = function update(dt) {
          var _this$_gunboots$charg, _this$_gunboots;
          if (!this._gunboots) {
            var _find$getComponent, _find;
            this._gunboots = (_find$getComponent = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(Gunboots)) != null ? _find$getComponent : null;
          }
          var charge = (_this$_gunboots$charg = (_this$_gunboots = this._gunboots) == null ? void 0 : _this$_gunboots.charge) != null ? _this$_gunboots$charg : 0;
          this._accum += dt;
          if (this._accum >= REDRAW_INTERVAL || charge !== this._lastCharge) {
            this._accum = 0;
            this._lastCharge = charge;
            this._redraw();
          }
        };
        _proto._redraw = function _redraw() {
          var _this$_gunboots$charg2, _this$_gunboots2;
          var g = this.getComponent(Graphics);
          var ut = this.getComponent(UITransform);
          if (!g || !ut) {
            return;
          }
          var chargeMax = getTuning().gunboots.chargeMax;
          var filled = (_this$_gunboots$charg2 = (_this$_gunboots2 = this._gunboots) == null ? void 0 : _this$_gunboots2.charge) != null ? _this$_gunboots$charg2 : 0;
          var step = CELL_W + CELL_GAP;
          var startX = -56 + Math.max(0, 8 - chargeMax) * step;
          g.clear();
          g.strokeColor = new Color(255, 255, 255, 60);
          g.lineWidth = 1;
          g.rect(startX - 1, -CELL_H / 2 - 1, chargeMax * step - CELL_GAP + 2, CELL_H + 2);
          g.stroke();
          for (var i = 0; i < chargeMax; i += 1) {
            var x = startX + i * step;
            var y = -CELL_H / 2;
            if (i < filled) {
              g.fillColor = new Color(240, 224, 112, 255);
            } else {
              g.fillColor = new Color(255, 255, 255, 30);
            }
            g.rect(x, y, CELL_W, CELL_H);
            g.fill();
          }
        };
        return ChargeBar;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DebugOverlay.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts'], function (exports) {
  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, _createClass, cclegacy, _decorator, Label, find, director, Component, FixedStepDriver, initTuning, getTuning, getTuningSource;
  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      find = module.find;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
      getTuningSource = module.getTuningSource;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;
      cclegacy._RF.push({}, "bd14cmK4clOg6BCf/H/gkBy", "DebugOverlay", undefined);
      var ccclass = _decorator.ccclass,
        property = _decorator.property;
      var LINE_PATHS = ['Panel/Line0', 'Panel/Line1', 'Panel/Line2', 'Panel/Line3'];
      var REFRESH_INTERVAL_MS = 250;
      var DebugOverlay = exports('DebugOverlay', (_dec = ccclass('DebugOverlay'), _dec2 = property(FixedStepDriver), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DebugOverlay, _Component);
        function DebugOverlay() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _initializerDefineProperty(_this, "driver", _descriptor, _assertThisInitialized(_this));
          _this._lines = [null, null, null, null];
          _this._lastRefreshMs = 0;
          _this._fps = 0;
          _this._frameCount = 0;
          _this._fpsWindowStartMs = 0;
          return _this;
        }
        var _proto = DebugOverlay.prototype;
        _proto.onLoad = function onLoad() {
          void initTuning();
          this._bindLines();
          this._resolveDriver();
          var now = performance.now();
          this._lastRefreshMs = now;
          this._fpsWindowStartMs = now;
        };
        _proto.start = function start() {
          if (!this.driver) {
            this._resolveDriver();
          }
        };
        _proto.update = function update(_dt) {
          this._frameCount += 1;
          var now = performance.now();
          this._updateFps(now);
          if (now - this._lastRefreshMs < REFRESH_INTERVAL_MS) {
            return;
          }
          this._lastRefreshMs = now;
          this._refresh();
        };
        _proto._bindLines = function _bindLines() {
          for (var i = 0; i < LINE_PATHS.length; i++) {
            var path = LINE_PATHS[i];
            var node = this.node.getChildByPath(path);
            if (!node) {
              console.error("[DebugOverlay] missing child path: " + path);
              continue;
            }
            var label = node.getComponent(Label);
            if (!label) {
              console.error("[DebugOverlay] missing Label at path: " + path);
              continue;
            }
            this._lines[i] = label;
          }
        };
        _proto._resolveDriver = function _resolveDriver() {
          if (this.driver) {
            return;
          }
          var gameNode = find('Game');
          var found = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (found) {
            this.driver = found;
            return;
          }
          var scene = director.getScene();
          var topNames = scene ? scene.children.map(function (child) {
            return child.name;
          }) : [];
          console.error('[DebugOverlay] FixedStepDriver not assigned and find(\'Game\') failed', topNames);
        };
        _proto._updateFps = function _updateFps(nowMs) {
          var elapsedSec = (nowMs - this._fpsWindowStartMs) / 1000;
          if (elapsedSec < 1) {
            if (elapsedSec > 0) {
              this._fps = this._frameCount / elapsedSec;
            }
            return;
          }
          this._fps = this._frameCount / elapsedSec;
          this._frameCount = 0;
          this._fpsWindowStartMs = nowMs;
        };
        _proto._refresh = function _refresh() {
          var driver = this.driver;
          var stepCount = driver ? driver.stepCount : 0;
          var droppedSteps = driver ? driver.droppedSteps : 0;
          var stepsPerSec = driver ? driver.measuredStepsPerSec : 0;
          var tuning = getTuning();
          var source = getTuningSource();
          this._setLine(0, "step " + stepCount + "  drop " + droppedSteps);
          this._setLine(1, "steps/s " + stepsPerSec.toFixed(2));
          this._setLine(2, "render fps " + this._fps.toFixed(1));
          this._setLine(3, "design " + tuning.render.designWidth + "x" + tuning.render.designHeight + "  scale " + tuning.render.pixelScale + "  tuning " + source);
        };
        _proto._setLine = function _setLine(index, text) {
          var label = this._lines[index];
          if (label) {
            label.string = text;
          }
        };
        _createClass(DebugOverlay, [{
          key: "renderFps",
          get: function get() {
            return this._fps;
          }
        }]);
        return DebugOverlay;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "driver", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/DebugOverlayLoader.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './DebugOverlay.ts', './FixedStepDriver.ts', './TuningConfig.ts', './BulletPool.ts', './Gunboots.ts', './ChargeBar.ts', './HeartHud.ts', './GameOver.ts', './PlayerHealth.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, assetManager, Prefab, instantiate, UITransform, view, settings, Component, DebugOverlay, FixedStepDriver, getTuning, getTuningSource, BulletPool, Gunboots, ChargeBar, HeartHud, GameOver, PlayerHealth;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      assetManager = module.assetManager;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      UITransform = module.UITransform;
      view = module.view;
      settings = module.settings;
      Component = module.Component;
    }, function (module) {
      DebugOverlay = module.DebugOverlay;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      getTuning = module.getTuning;
      getTuningSource = module.getTuningSource;
    }, function (module) {
      BulletPool = module.BulletPool;
    }, function (module) {
      Gunboots = module.Gunboots;
    }, function (module) {
      ChargeBar = module.ChargeBar;
    }, function (module) {
      HeartHud = module.HeartHud;
    }, function (module) {
      GameOver = module.GameOver;
    }, function (module) {
      PlayerHealth = module.PlayerHealth;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "3e51ebaMGtN16MZwZ3CLm5P", "DebugOverlayLoader", undefined);
      var ccclass = _decorator.ccclass;
      var selfCheckLogged = false;
      var DebugOverlayLoader = exports('DebugOverlayLoader', (_dec = ccclass('DebugOverlayLoader'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(DebugOverlayLoader, _Component);
        function DebugOverlayLoader() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = DebugOverlayLoader.prototype;
        _proto.onLoad = function onLoad() {
          var _this = this;
          this._ensureGameplayComponents();
          var canvas = find('Canvas');
          if (!canvas) {
            console.error('Canvas not found');
            return;
          }
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.load('prefab/DebugOverlay', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] bundle.load failed bundle=mainui path=prefab/DebugOverlay', loadErr);
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              // Prefab 里 local pos (5,-5)+锚点(0,1) 表示「相对父节点左上角偏移」。
              // Canvas 锚点在中心，挂到 Canvas 下后要把该语义换算成中心坐标系。
              var ut = canvas.getComponent(UITransform); // 160 x 284
              var margin = 5; // HUD 边距，M0 起手值
              if (ut) {
                node.setPosition(-ut.width / 2 + margin, ut.height / 2 - margin);
              }
              var overlay = node.getComponent(DebugOverlay);
              if (!overlay) {
                console.error('[DebugOverlayLoader] DebugOverlay component missing on instantiated prefab/DebugOverlay');
                return;
              }
              overlay.driver = _this.getComponent(FixedStepDriver);
              console.log('[DebugOverlayLoader] prefab instantiated');
              setTimeout(function () {
                _this._logSelfCheck(overlay);
              }, 3000);
              _this._loadTouchControls(canvas);
              _this._loadChargeBar(canvas);
              _this._loadHeartHud(canvas);
              _this._loadGameOver(canvas);
            });
          });
        };
        _proto._ensureGameplayComponents = function _ensureGameplayComponents() {
          var game = find('Game');
          if (game && !game.getComponent(BulletPool)) {
            game.addComponent(BulletPool);
          }
          var player = find('World/Player');
          if (player && !player.getComponent(Gunboots)) {
            player.addComponent(Gunboots);
          }
          if (player && !player.getComponent(PlayerHealth)) {
            player.addComponent(PlayerHealth);
          }
        };
        _proto._loadChargeBar = function _loadChargeBar(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for ChargeBar', bundleErr);
              return;
            }
            bundle.load('prefab/ChargeBar', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] charge bar prefab load failed: prefab/ChargeBar');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(0, -88);
              if (!node.getComponent(ChargeBar)) {
                node.addComponent(ChargeBar);
              }
            });
          });
        };
        _proto._loadTouchControls = function _loadTouchControls(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for TouchControls', bundleErr);
              return;
            }
            bundle.load('prefab/TouchControls', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] touch controls prefab load failed: prefab/TouchControls');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(0, 0);
            });
          });
        };
        _proto._loadHeartHud = function _loadHeartHud(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for HeartHud', bundleErr);
              return;
            }
            bundle.load('prefab/HeartHud', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] heart hud prefab load failed: prefab/HeartHud');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(0, 86);
              if (!node.getComponent(HeartHud)) {
                node.addComponent(HeartHud);
              }
            });
          });
        };
        _proto._loadGameOver = function _loadGameOver(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for GameOver', bundleErr);
              return;
            }
            bundle.load('prefab/GameOver', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] game over prefab load failed: prefab/GameOver');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(0, 0);
              if (!node.getComponent(GameOver)) {
                node.addComponent(GameOver);
              }
            });
          });
        };
        _proto._logSelfCheck = function _logSelfCheck(overlay) {
          if (selfCheckLogged) {
            return;
          }
          selfCheckLogged = true;
          var driver = this.getComponent(FixedStepDriver);
          var stepCount = driver ? driver.stepCount : 0;
          var measuredStepsPerSec = driver ? driver.measuredStepsPerSec : 0;
          var droppedSteps = driver ? driver.droppedSteps : 0;
          var tuning = getTuning();
          var pixelScale = tuning.render.pixelScale;
          var tuningSource = getTuningSource();
          var renderFps = overlay.renderFps;
          var canvasClientW = -1;
          var canvasClientH = -1;
          var canvasBackW = -1;
          var canvasBackH = -1;
          if (typeof document !== 'undefined') {
            var gameCanvas = document.getElementById('GameCanvas');
            if (gameCanvas instanceof HTMLCanvasElement) {
              canvasBackW = gameCanvas.width;
              canvasBackH = gameCanvas.height;
              var rect = gameCanvas.getBoundingClientRect();
              canvasClientW = rect.width;
              canvasClientH = rect.height;
            }
          }
          var viewScale = view.getScaleX();
          var vp = view.getViewportRect();
          var viewViewport = {
            x: vp.x,
            y: vp.y,
            width: vp.width,
            height: vp.height
          };
          var selfCheck = {
            stepCount: stepCount,
            measuredStepsPerSec: measuredStepsPerSec,
            droppedSteps: droppedSteps,
            canvasClientW: canvasClientW,
            canvasClientH: canvasClientH,
            canvasBackW: canvasBackW,
            canvasBackH: canvasBackH,
            pixelScale: pixelScale,
            tuningSource: tuningSource,
            renderFps: renderFps,
            viewScale: viewScale,
            viewViewport: viewViewport
          };
          var exactFitScreen = settings == null || settings.querySettings == null ? void 0 : settings.querySettings('screen', 'exactFitScreen');
          if (exactFitScreen !== null && exactFitScreen !== undefined) {
            selfCheck.exactFitScreen = exactFitScreen;
          }
          console.log('SELFCHECK ' + JSON.stringify(selfCheck));
        };
        return DebugOverlayLoader;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Enemy.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, UITransform, Sprite, Color, assetManager, SpriteFrame, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Color = module.Color;
      assetManager = module.assetManager;
      SpriteFrame = module.SpriteFrame;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "1d691cdqMRPXYZ3Z7DEWkLt", "Enemy", undefined);
      var ccclass = _decorator.ccclass;
      var EPS = 1e-4;
      var Enemy = exports('Enemy', (_dec = ccclass('Enemy'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Enemy, _Component);
        function Enemy() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.vx = 0;
          _this.vy = 0;
          _this.hp = 0;
          _this.maxHp = 0;
          _this.kind = 'snail';
          _this.hitFlashSteps = 0;
          _this.alive = false;
          _this._sprite = null;
          _this._frames = [null, null, null, null];
          _this._framesLoaded = false;
          _this._framesLoading = false;
          _this._animStep = 0;
          _this._phase = 0;
          _this._baseY = 0;
          _this._batStepCount = 0;
          _this._batDir = 1;
          return _this;
        }
        var _proto = Enemy.prototype;
        _proto.init = function init(kind, x, y, hp) {
          this.kind = kind;
          this.hp = hp;
          this.maxHp = hp;
          this.alive = true;
          this.hitFlashSteps = 0;
          this._animStep = 0;
          this._phase = 0;
          this._batStepCount = 0;
          this.node.setPosition(x, y);
          this.node.active = true;
          var ut = this.getComponent(UITransform);
          if (ut) {
            var size = kind === 'snail' ? 32 : 24;
            ut.setContentSize(size, size);
          }
          if (kind === 'snail') {
            this.vx = 0.35;
            this.vy = 0;
          } else {
            this.vx = 0.25;
            this.vy = 0;
            this._baseY = y;
            this._batDir = 1;
          }
          if (!this._sprite) {
            this._sprite = this.getComponent(Sprite);
          }
          if (this._sprite) {
            this._sprite.color = new Color(255, 255, 255, 255);
          }
          this._ensureFramesLoaded();
        };
        _proto.step = function step(tileSize, isSolidAt) {
          if (!this.alive) {
            return true;
          }
          if (this.kind === 'snail') {
            this._stepSnail(tileSize, isSolidAt);
          } else {
            this._stepBat(tileSize);
          }
          if (this.hitFlashSteps > 0) {
            this.hitFlashSteps -= 1;
            if (this._sprite) {
              this._sprite.color = this.hitFlashSteps % 2 === 1 ? new Color(255, 120, 120, 255) : new Color(255, 255, 255, 255);
            }
            if (this.hitFlashSteps === 0 && this._sprite) {
              this._sprite.color = new Color(255, 255, 255, 255);
            }
          }
          this._updateAnimFrame();
          return !this.alive;
        };
        _proto.damage = function damage(n) {
          this.hp -= n;
          this.hitFlashSteps = 6;
          if (this.hp <= 0) {
            this.alive = false;
            return true;
          }
          return false;
        };
        _proto._stepSnail = function _stepSnail(tileSize, isSolidAt) {
          var x = this.node.position.x;
          var y = this.node.position.y;
          var ut = this.getComponent(UITransform);
          var halfW = ut ? ut.width / 2 : 16;
          var halfH = ut ? ut.height / 2 : 16;
          var bottom = y - halfH;
          var row = Math.floor((-bottom - EPS) / tileSize);
          var probeX = x + this.vx;
          var frontCol = this.vx > 0 ? Math.floor((probeX + halfW) / tileSize) : Math.floor((probeX - halfW) / tileSize);
          var wallAhead = isSolidAt(frontCol, row);
          var cliffAhead = isSolidAt(frontCol, row + 1) === false;
          if (wallAhead && cliffAhead) {
            return;
          }
          if (wallAhead || cliffAhead) {
            this.vx = -this.vx;
            return;
          }
          this.node.setPosition(probeX, y);
        };
        _proto._stepBat = function _stepBat(tileSize) {
          this._phase += 0.06;
          this._batStepCount += 1;
          if (this._batStepCount >= 90) {
            this._batStepCount = 0;
            this._batDir = -this._batDir;
          }
          this.vx = this._batDir * 0.25;
          var x = this.node.position.x;
          this.node.setPosition(x + this.vx, this._baseY + Math.sin(this._phase) * 6);
        };
        _proto._updateAnimFrame = function _updateAnimFrame() {
          if (!this._framesLoaded) {
            return;
          }
          this._animStep += 1;
          if (this._animStep % 8 !== 0) {
            return;
          }
          var frameIndex = Math.floor(this._animStep / 8) % 4;
          var frame = this._frames[frameIndex];
          if (frame && this._sprite) {
            this._sprite.spriteFrame = frame;
          }
        };
        _proto._ensureFramesLoaded = function _ensureFramesLoaded() {
          var _this2 = this;
          if (this._framesLoaded || this._framesLoading) {
            return;
          }
          this._framesLoading = true;
          var prefix = this.kind === 'bat' ? 'sprite/enemy/bat_' : 'sprite/enemy/snail_';
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[Enemy] sprite load failed kind=' + _this2.kind);
              _this2._framesLoading = false;
              return;
            }
            var pending = 4;
            var _loop = function _loop(i) {
              var path = "" + prefix + String(i).padStart(2, '0') + "/spriteFrame";
              bundle.load(path, SpriteFrame, function (loadErr, frame) {
                if (loadErr || !frame) {
                  console.error('[Enemy] sprite load failed kind=' + _this2.kind);
                } else {
                  _this2._frames[i] = frame;
                }
                pending -= 1;
                if (pending === 0) {
                  _this2._framesLoaded = _this2._frames.every(function (f) {
                    return f !== null;
                  });
                  _this2._framesLoading = false;
                  if (_this2._framesLoaded && _this2._frames[0] && _this2._sprite) {
                    _this2._sprite.spriteFrame = _this2._frames[0];
                  }
                }
              });
            };
            for (var i = 0; i < 4; i += 1) {
              _loop(i);
            }
          });
        };
        return Enemy;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/EnemyManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts', './BulletPool.ts', './Enemy.ts', './LevelData.ts', './PlayerHealth.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, assetManager, Prefab, instantiate, UITransform, Component, FixedStepDriver, getTuning, BulletPool, Enemy, LEVEL_ROWS, LEVEL_COLS, LEVEL_GRID, PlayerHealth;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      assetManager = module.assetManager;
      Prefab = module.Prefab;
      instantiate = module.instantiate;
      UITransform = module.UITransform;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      BulletPool = module.BulletPool;
    }, function (module) {
      Enemy = module.Enemy;
    }, function (module) {
      LEVEL_ROWS = module.LEVEL_ROWS;
      LEVEL_COLS = module.LEVEL_COLS;
      LEVEL_GRID = module.LEVEL_GRID;
    }, function (module) {
      PlayerHealth = module.PlayerHealth;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "6754e7sG7FDmIw66eUW2Y3a", "EnemyManager", undefined);
      var ccclass = _decorator.ccclass;
      var ENEMY_POOL_SIZE = 12; // TODO 待外置到 tuning

      var INITIAL_SPAWNS = [{
        kind: 'bat',
        x: 80,
        y: -160,
        hp: 1
      }, {
        kind: 'bat',
        x: 70,
        y: -300,
        hp: 1
      }, {
        kind: 'bat',
        x: 96,
        y: -460,
        hp: 1
      }, {
        kind: 'bat',
        x: 60,
        y: -620,
        hp: 1
      }, {
        kind: 'snail',
        x: 56,
        y: -344,
        hp: 2
      }, {
        kind: 'snail',
        x: 104,
        y: -504,
        hp: 2
      }, {
        kind: 'snail',
        x: 80,
        y: -784,
        hp: 2
      }];
      var EnemyManager = exports('EnemyManager', (_dec = ccclass('EnemyManager'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(EnemyManager, _Component);
        function EnemyManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._world = null;
          _this._free = [];
          _this._active = [];
          _this._poolReady = false;
          _this._stepBound = false;
          _this._bulletPool = null;
          _this._playerHealth = null;
          return _this;
        }
        var _proto = EnemyManager.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          this._world = find('World');
          if (!this._world) {
            console.error('[EnemyManager] World node not found');
            return;
          }
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[EnemyManager] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.load('prefab/Enemy', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[EnemyManager] prefab/Enemy load failed');
                return;
              }
              for (var i = 0; i < ENEMY_POOL_SIZE; i += 1) {
                var node = instantiate(prefab);
                _this2._world.addChild(node);
                var enemy = node.getComponent(Enemy);
                if (!enemy) {
                  enemy = node.addComponent(Enemy);
                }
                node.active = false;
                _this2._free.push(enemy);
              }
              _this2._poolReady = true;
              _this2._spawnInitial();
            });
          });
          this._bindStep();
          if (typeof window !== 'undefined') {
            window.__dwEnemies = this;
            window.__dwEnemyList = this._active;
          }
        };
        _proto._bindStep = function _bindStep() {
          var _this3 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[EnemyManager] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this3.enabled && _this3.node.activeInHierarchy) {
              _this3._step();
            }
          });
          this._stepBound = true;
        };
        _proto._spawnInitial = function _spawnInitial() {
          if (!this._poolReady) {
            return;
          }
          for (var i = 0; i < INITIAL_SPAWNS.length; i += 1) {
            var s = INITIAL_SPAWNS[i];
            this._spawnOne(s.kind, s.x, s.y, s.hp);
          }
        };
        _proto._spawnOne = function _spawnOne(kind, x, y, hp) {
          var enemy = this._free.pop();
          if (!enemy) {
            console.warn('[EnemyManager] enemy pool empty');
            return null;
          }
          enemy.init(kind, x, y, hp);
          this._active.push(enemy);
          return enemy;
        };
        _proto._step = function _step() {
          var tileSize = getTuning().level.tileSize;
          var isSolidAt = function isSolidAt(col, row) {
            if (row < 0 || row >= LEVEL_ROWS || col < 0 || col >= LEVEL_COLS) {
              return true;
            }
            return LEVEL_GRID[row][col] === 1;
          };
          for (var i = this._active.length - 1; i >= 0; i -= 1) {
            var enemy = this._active[i];
            if (enemy.step(tileSize, isSolidAt)) {
              this._recycle(enemy);
            }
          }
          if (!this._bulletPool) {
            var _find$getComponent, _find;
            this._bulletPool = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(BulletPool)) != null ? _find$getComponent : null;
          }
          var pool = this._bulletPool;
          if (!pool) {
            return;
          }
          var bullets = [].concat(pool.activeBullets);
          for (var bi = 0; bi < bullets.length; bi += 1) {
            var bullet = bullets[bi];
            if (!bullet.node.active) {
              continue;
            }
            var but = bullet.getComponent(UITransform);
            var bhw = but ? but.width / 2 : 1.5;
            var bhh = but ? but.height / 2 : 3;
            var bx = bullet.node.position.x;
            var by = bullet.node.position.y;
            for (var ei = this._active.length - 1; ei >= 0; ei -= 1) {
              var _enemy = this._active[ei];
              if (!_enemy.alive) {
                continue;
              }
              var eut = _enemy.getComponent(UITransform);
              if (!eut) {
                continue;
              }
              var ehw = eut.width / 2;
              var ehh = eut.height / 2;
              var ex = _enemy.node.position.x;
              var ey = _enemy.node.position.y;
              if (Math.abs(ex - bx) < ehw + bhw && Math.abs(ey - by) < ehh + bhh) {
                pool.recycle(bullet);
                if (_enemy.damage(1)) {
                  this._recycle(_enemy);
                }
                break;
              }
            }
          }
          if (!this._playerHealth) {
            var _find$getComponent2, _find2;
            this._playerHealth = (_find$getComponent2 = (_find2 = find('World/Player')) == null ? void 0 : _find2.getComponent(PlayerHealth)) != null ? _find$getComponent2 : null;
          }
          var playerHealth = this._playerHealth;
          if (!playerHealth || playerHealth.isDead) {
            return;
          }
          var playerNode = find('World/Player');
          if (!playerNode) {
            return;
          }
          var player = getTuning().player;
          var phw = player.bodyWidth / 2;
          var phh = player.bodyHeight / 2;
          var px = playerNode.position.x;
          var py = playerNode.position.y;
          for (var _ei = 0; _ei < this._active.length; _ei += 1) {
            var _enemy2 = this._active[_ei];
            if (!_enemy2.alive) {
              continue;
            }
            var _eut = _enemy2.getComponent(UITransform);
            if (!_eut) {
              continue;
            }
            var _ehw = _eut.width / 2;
            var _ehh = _eut.height / 2;
            var _ex = _enemy2.node.position.x;
            var _ey = _enemy2.node.position.y;
            if (Math.abs(_ex - px) < _ehw + phw && Math.abs(_ey - py) < _ehh + phh) {
              if (playerHealth.takeDamage(1, _ex)) {
                break;
              }
            }
          }
        };
        _proto._recycle = function _recycle(e) {
          var idx = this._active.indexOf(e);
          if (idx >= 0) {
            this._active.splice(idx, 1);
          }
          e.node.active = false;
          this._free.push(e);
        };
        _createClass(EnemyManager, [{
          key: "aliveCount",
          get: function get() {
            return this._active.length;
          }
        }]);
        return EnemyManager;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FixedStepDriver.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './stepAccumulator.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Component, initTuning, getTuning, advance;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      advance = module.advance;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "0b261fLmttBE7zkWxZFDE2a", "FixedStepDriver", undefined);
      var ccclass = _decorator.ccclass;
      var MEASURE_WINDOW_MS = 1000;
      var MEASURE_WINDOW_COUNT = 5;
      var FixedStepDriver = exports('FixedStepDriver', (_dec = ccclass('FixedStepDriver'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(FixedStepDriver, _Component);
        function FixedStepDriver() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._stepSeconds = 1 / 60;
          _this._stepMs = 1000 / 60;
          _this._maxCatchUpSteps = 5;
          _this._accumulatorMs = 0;
          _this._lastNowMs = 0;
          _this._stepCount = 0;
          _this._droppedSteps = 0;
          _this._onStep = [];
          _this._windowStartMs = 0;
          _this._windowSteps = 0;
          _this._windowRates = [];
          _this._measuredStepsPerSec = 0;
          return _this;
        }
        var _proto = FixedStepDriver.prototype;
        _proto.registerOnStep = function registerOnStep(cb) {
          this._onStep.push(cb);
        };
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          this._applyTuning();
          void initTuning().then(function () {
            _this2._applyTuning();
          });
        };
        _proto.onEnable = function onEnable() {
          var now = performance.now();
          this._lastNowMs = now;
          this._windowStartMs = now;
          this._accumulatorMs = 0;
        };
        _proto.update = function update(_dt) {
          var now = performance.now();
          var elapsedMs = now - this._lastNowMs;
          this._lastNowMs = now;
          var result = this._stepOnce(elapsedMs);
          for (var i = 0; i < result.steps; i++) {
            this._stepCount += 1;
            this._windowSteps += 1;
            this._emitStep();
          }
          this._droppedSteps += result.dropped;
          this._updateMeasuredRate(now);
        }

        /**
         * 仅供调试浮层/控制台调用，不进主循环。
         * 用独立累加器跑 frames 帧，不改真实 stepCount / droppedSteps。
         */;
        _proto.debugSimulate = function debugSimulate(frames, frameMs) {
          var savedAccMs = this._accumulatorMs;
          this._accumulatorMs = 0;
          var steps = 0;
          var drop = 0;
          for (var i = 0; i < frames; i++) {
            var result = this._stepOnce(frameMs);
            steps += result.steps;
            drop += result.dropped;
          }
          this._accumulatorMs = savedAccMs;
          return {
            steps: steps,
            drop: drop
          };
        };
        _proto._stepOnce = function _stepOnce(elapsedMs) {
          var result = advance(this._accumulatorMs, this._stepMs, elapsedMs, this._maxCatchUpSteps);
          this._accumulatorMs = result.accMs;
          return {
            steps: result.steps,
            dropped: result.dropped
          };
        };
        _proto._applyTuning = function _applyTuning() {
          var tuning = getTuning();
          var hz = tuning.loop.fixedStepHz;
          this._stepSeconds = 1 / hz;
          this._stepMs = 1000 / hz;
          this._maxCatchUpSteps = tuning.loop.maxCatchUpSteps;
        };
        _proto._emitStep = function _emitStep() {
          var callbacks = this._onStep;
          for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
          }
        };
        _proto._updateMeasuredRate = function _updateMeasuredRate(nowMs) {
          var windowElapsedMs = nowMs - this._windowStartMs;
          if (windowElapsedMs < MEASURE_WINDOW_MS) {
            return;
          }
          var elapsedSec = windowElapsedMs / 1000;
          var rate = elapsedSec > 0 ? this._windowSteps / elapsedSec : 0;
          this._windowRates.push(rate);
          if (this._windowRates.length > MEASURE_WINDOW_COUNT) {
            this._windowRates.shift();
          }
          var sum = 0;
          for (var i = 0; i < this._windowRates.length; i++) {
            sum += this._windowRates[i];
          }
          this._measuredStepsPerSec = sum / this._windowRates.length;
          this._windowSteps = 0;
          this._windowStartMs = nowMs;
        };
        _createClass(FixedStepDriver, [{
          key: "stepCount",
          get: function get() {
            return this._stepCount;
          }
        }, {
          key: "droppedSteps",
          get: function get() {
            return this._droppedSteps;
          }
        }, {
          key: "measuredStepsPerSec",
          get: function get() {
            return this._measuredStepsPerSec;
          }
        }, {
          key: "stepSeconds",
          get: function get() {
            return this._stepSeconds;
          }
        }]);
        return FixedStepDriver;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GameOver.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Graphics, UITransform, Color, director, Component, FixedStepDriver, getTuning;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Graphics = module.Graphics;
      UITransform = module.UITransform;
      Color = module.Color;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      getTuning = module.getTuning;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "a9b8cfW5fRDIYdlQyEJh2VD", "GameOver", undefined);
      var ccclass = _decorator.ccclass;
      var GameOver = exports('GameOver', (_dec = ccclass('GameOver'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GameOver, _Component);
        function GameOver() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._shownStep = -1;
          _this._pointerBound = false;
          _this._onPointer = function (ev) {
            var _find, _driver$stepCount;
            if (!_this.node.active) {
              return;
            }
            var driver = (_find = find('Game')) == null ? void 0 : _find.getComponent(FixedStepDriver);
            var step = (_driver$stepCount = driver == null ? void 0 : driver.stepCount) != null ? _driver$stepCount : 0;
            var delay = getTuning().health.deathRestartDelaySteps;
            if (step - _this._shownStep < delay) {
              ev.preventDefault();
              return;
            }
            ev.preventDefault();
            director.loadScene('Main');
          };
          return _this;
        }
        var _proto = GameOver.prototype;
        _proto.onLoad = function onLoad() {
          this.node.active = false;
          this._drawMask();
        };
        _proto.onEnable = function onEnable() {
          if (typeof window === 'undefined' || this._pointerBound) {
            return;
          }
          window.addEventListener('pointerdown', this._onPointer, {
            capture: true,
            passive: false
          });
          this._pointerBound = true;
        };
        _proto.onDisable = function onDisable() {
          if (typeof window === 'undefined' || !this._pointerBound) {
            return;
          }
          window.removeEventListener('pointerdown', this._onPointer, {
            capture: true
          });
          this._pointerBound = false;
        };
        _proto.show = function show() {
          var _find2, _driver$stepCount2;
          this.node.active = true;
          var driver = (_find2 = find('Game')) == null ? void 0 : _find2.getComponent(FixedStepDriver);
          this._shownStep = (_driver$stepCount2 = driver == null ? void 0 : driver.stepCount) != null ? _driver$stepCount2 : 0;
        };
        _proto.hide = function hide() {
          this.node.active = false;
        };
        _proto._drawMask = function _drawMask() {
          var gfx = this.getComponent(Graphics);
          var ut = this.getComponent(UITransform);
          if (!gfx || !ut) {
            return;
          }
          var w = ut.width;
          var h = ut.height;
          gfx.clear();
          gfx.fillColor = new Color(0, 0, 0, 170);
          gfx.rect(-w / 2, -h / 2, w, h);
          gfx.fill();
        };
        return GameOver;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Gunboots.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './InputState.ts', './TuningConfig.ts', './BulletPool.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, Component, FixedStepDriver, inputState, getTuning, initTuning, BulletPool, PlayerController;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      inputState = module.inputState;
    }, function (module) {
      getTuning = module.getTuning;
      initTuning = module.initTuning;
    }, function (module) {
      BulletPool = module.BulletPool;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "0f4d4tzIk5DNbweVGkP79uw", "Gunboots", undefined);
      var ccclass = _decorator.ccclass;
      var Gunboots = exports('Gunboots', (_dec = ccclass('Gunboots'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Gunboots, _Component);
        function Gunboots() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._charge = 0;
          _this._cooldown = 0;
          _this._stepsSinceLastShot = 0;
          _this._rechargeStepAcc = 0;
          _this._stepBound = false;
          _this._player = null;
          _this._pool = null;
          return _this;
        }
        var _proto = Gunboots.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          this._charge = getTuning().gunboots.chargeMax;
          void initTuning().then(function () {
            _this2._charge = getTuning().gunboots.chargeMax;
          });
          this._player = this.getComponent(PlayerController);
          if (!this._player) {
            console.error('[Gunboots] PlayerController missing on same node');
          }
          this._bindStep();
          if (typeof window !== 'undefined') {
            window.__dwGunboots = this;
          }
        };
        _proto._bindStep = function _bindStep() {
          var _this3 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[Gunboots] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this3.enabled && _this3.node.activeInHierarchy) {
              _this3._step();
            }
          });
          this._stepBound = true;
        };
        _proto._step = function _step() {
          var _this$_pool;
          if (!this._pool) {
            var _find$getComponent, _find;
            this._pool = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(BulletPool)) != null ? _find$getComponent : null;
          }
          var tuning = getTuning();
          var g = tuning.gunboots;
          var grounded = this._player ? this._player.onGround : false;
          /** 只有离地才能开火（用户拍板） */
          var fireAllowed = inputState.fireHeld && !grounded;
          if (this._player) {
            this._player.firingHeld = fireAllowed;
          }
          if (fireAllowed && this._cooldown <= 0 && this._charge >= g.chargeCostPerShot) {
            var _this$_player;
            this._charge -= g.chargeCostPerShot;
            this._cooldown = g.fireIntervalSteps;
            this._spawnBullet(g);
            (_this$_player = this._player) == null || _this$_player.applyRecoil(g);
            this._stepsSinceLastShot = 0;
            this._rechargeStepAcc = 0;
          } else {
            this._cooldown = Math.max(0, this._cooldown - 1);
            this._stepsSinceLastShot += 1;
          }
          if (!fireAllowed && this._stepsSinceLastShot >= g.rechargeDelaySteps) {
            this._rechargeStepAcc += 1;
            if (this._rechargeStepAcc >= g.rechargeStepsPerCell) {
              this._rechargeStepAcc = 0;
              this._charge = Math.min(g.chargeMax, this._charge + 1);
            }
          }
          (_this$_pool = this._pool) == null || _this$_pool.stepBullets(tuning.level.tileSize);
        };
        _proto._spawnBullet = function _spawnBullet(g) {
          if (!this._pool || !this._player) {
            return;
          }
          var pos = this._player.position;
          var halfH = getTuning().player.bodyHeight / 2;
          var spawnY = pos.y - halfH;
          this._pool.spawn(pos.x, spawnY, 0, -g.bulletSpeed, g.bulletLifeSteps);
        };
        _createClass(Gunboots, [{
          key: "charge",
          get: function get() {
            return this._charge;
          }
        }, {
          key: "chargeMax",
          get: function get() {
            return getTuning().gunboots.chargeMax;
          }
        }, {
          key: "canFire",
          get: function get() {
            var g = getTuning().gunboots;
            return this._charge >= g.chargeCostPerShot && this._cooldown <= 0;
          }
        }]);
        return Gunboots;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HeartHud.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './PlayerHealth.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Graphics, UITransform, Color, Component, getTuning, PlayerHealth;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Graphics = module.Graphics;
      UITransform = module.UITransform;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      PlayerHealth = module.PlayerHealth;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "f1e2dPEtaZHiZASNFZ4mrze", "HeartHud", undefined);
      var ccclass = _decorator.ccclass;
      var CELL = 8;
      var RADIUS = 2;
      var LEFT_MARGIN = 6;
      var CELL_STEP = 13;
      var REDRAW_INTERVAL = 0.1;
      var HeartHud = exports('HeartHud', (_dec = ccclass('HeartHud'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(HeartHud, _Component);
        function HeartHud() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._accum = 0;
          _this._lastHp = -1;
          _this._health = null;
          return _this;
        }
        var _proto = HeartHud.prototype;
        _proto.onLoad = function onLoad() {
          this._redraw();
        };
        _proto.update = function update(dt) {
          var _this$_health$hp, _this$_health;
          if (!this._health) {
            var _find$getComponent, _find;
            this._health = (_find$getComponent = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(PlayerHealth)) != null ? _find$getComponent : null;
          }
          var hp = (_this$_health$hp = (_this$_health = this._health) == null ? void 0 : _this$_health.hp) != null ? _this$_health$hp : 0;
          this._accum += dt;
          if (this._accum >= REDRAW_INTERVAL || hp !== this._lastHp) {
            this._accum = 0;
            this._lastHp = hp;
            this._redraw();
          }
        };
        _proto._redraw = function _redraw() {
          var _this$_health$hp2, _this$_health2;
          var g = this.getComponent(Graphics);
          var ut = this.getComponent(UITransform);
          if (!g || !ut) {
            return;
          }
          var maxHp = getTuning().health.maxHp;
          var hp = (_this$_health$hp2 = (_this$_health2 = this._health) == null ? void 0 : _this$_health2.hp) != null ? _this$_health$hp2 : maxHp;
          var leftEdge = -ut.width / 2 + LEFT_MARGIN;
          g.clear();
          for (var i = 0; i < maxHp; i += 1) {
            var x = leftEdge + i * CELL_STEP;
            var y = -CELL / 2;
            if (i < hp) {
              g.fillColor = new Color(224, 80, 96, 255);
              this._roundRect(g, x, y, CELL, CELL, RADIUS);
              g.fill();
            } else {
              g.strokeColor = new Color(255, 255, 255, 40);
              g.lineWidth = 1;
              this._roundRect(g, x, y, CELL, CELL, RADIUS);
              g.stroke();
            }
          }
        };
        _proto._roundRect = function _roundRect(g, x, y, w, h, r) {
          g.moveTo(x + r, y);
          g.lineTo(x + w - r, y);
          g.quadraticCurveTo(x + w, y, x + w, y + r);
          g.lineTo(x + w, y + h - r);
          g.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          g.lineTo(x + r, y + h);
          g.quadraticCurveTo(x, y + h, x, y + h - r);
          g.lineTo(x, y + r);
          g.quadraticCurveTo(x, y, x + r, y);
          g.close();
        };
        return HeartHud;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/InputState.ts", ['cc'], function (exports) {
  var cclegacy, KeyCode;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      KeyCode = module.KeyCode;
    }],
    execute: function () {
      cclegacy._RF.push({}, "d1e2fOktcZHidASNFZ4mrze", "InputState", undefined);
      var InputStateImpl = /*#__PURE__*/function () {
        function InputStateImpl() {
          this.left = false;
          this.right = false;
          this.jumpHeld = false;
          this.fireHeld = false;
          /** 本步内「刚按下跳」的边沿，由 FixedStepDriver 每步消费后清掉 */
          this.jumpPressed = false;
          this.firePressed = false;
          this._keyLeft = false;
          this._keyRight = false;
          this._keyJump = false;
          this._keyFire = false;
          this._touchLeft = false;
          this._touchRight = false;
          this._touchJump = false;
          this._touchFire = false;
          this._debugLeft = false;
          this._debugRight = false;
          this._debugJump = false;
          this._debugFire = false;
        }
        var _proto = InputStateImpl.prototype;
        _proto.setKey = function setKey(code, down) {
          switch (code) {
            case KeyCode.ARROW_LEFT:
            case KeyCode.KEY_A:
              this._setKeyChannel('left', down);
              break;
            case KeyCode.ARROW_RIGHT:
            case KeyCode.KEY_D:
              this._setKeyChannel('right', down);
              break;
            case KeyCode.SHIFT_LEFT:
            case KeyCode.SHIFT_RIGHT:
            case KeyCode.SPACE:
              this._setKeyChannel('jump', down);
              break;
            case KeyCode.KEY_Z:
            case KeyCode.KEY_J:
              this._setKeyChannel('fire', down);
              break;
          }
        };
        _proto.setTouch = function setTouch(button, down) {
          switch (button) {
            case 'left':
              this._setTouchChannel('left', down);
              break;
            case 'right':
              this._setTouchChannel('right', down);
              break;
            case 'jump':
              this._setTouchChannel('jump', down);
              break;
            case 'fire':
              this._setTouchChannel('fire', down);
              break;
          }
        };
        _proto.consumeEdges = function consumeEdges() {
          this.jumpPressed = false;
          this.firePressed = false;
        };
        _proto.debugSet = function debugSet(partial) {
          if (partial.left !== undefined) {
            this._debugLeft = partial.left;
          }
          if (partial.right !== undefined) {
            this._debugRight = partial.right;
          }
          if (partial.jumpHeld !== undefined) {
            if (partial.jumpHeld && !this._debugJump) {
              this.jumpPressed = true;
            }
            this._debugJump = partial.jumpHeld;
          }
          if (partial.fireHeld !== undefined) {
            if (partial.fireHeld && !this._debugFire) {
              this.firePressed = true;
            }
            this._debugFire = partial.fireHeld;
          }
          this._syncAggregate();
        };
        _proto.reset = function reset() {
          this._keyLeft = false;
          this._keyRight = false;
          this._keyJump = false;
          this._keyFire = false;
          this._touchLeft = false;
          this._touchRight = false;
          this._touchJump = false;
          this._touchFire = false;
          this._debugLeft = false;
          this._debugRight = false;
          this._debugJump = false;
          this._debugFire = false;
          this.jumpPressed = false;
          this.firePressed = false;
          this._syncAggregate();
        };
        _proto._setKeyChannel = function _setKeyChannel(channel, down) {
          switch (channel) {
            case 'left':
              this._keyLeft = down;
              break;
            case 'right':
              this._keyRight = down;
              break;
            case 'jump':
              if (down && !this._keyJump) {
                this.jumpPressed = true;
              }
              this._keyJump = down;
              break;
            case 'fire':
              if (down && !this._keyFire) {
                this.firePressed = true;
              }
              this._keyFire = down;
              break;
          }
          this._syncAggregate();
        };
        _proto._setTouchChannel = function _setTouchChannel(channel, down) {
          switch (channel) {
            case 'left':
              this._touchLeft = down;
              break;
            case 'right':
              this._touchRight = down;
              break;
            case 'jump':
              if (down && !this._touchJump) {
                this.jumpPressed = true;
              }
              this._touchJump = down;
              break;
            case 'fire':
              if (down && !this._touchFire) {
                this.firePressed = true;
              }
              this._touchFire = down;
              break;
          }
          this._syncAggregate();
        };
        _proto._syncAggregate = function _syncAggregate() {
          this.left = this._keyLeft || this._touchLeft || this._debugLeft;
          this.right = this._keyRight || this._touchRight || this._debugRight;
          this.jumpHeld = this._keyJump || this._touchJump || this._debugJump;
          this.fireHeld = this._keyFire || this._touchFire || this._debugFire;
        };
        return InputStateImpl;
      }();
      var inputState = exports('inputState', new InputStateImpl());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/KeyboardInput.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './InputState.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, input, Input, Component, inputState;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      input = module.input;
      Input = module.Input;
      Component = module.Component;
    }, function (module) {
      inputState = module.inputState;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e8f4aKxPF1Ob5ASNFZ4mrze", "KeyboardInput", undefined);
      var ccclass = _decorator.ccclass;
      var KeyboardInput = exports('KeyboardInput', (_dec = ccclass('KeyboardInput'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(KeyboardInput, _Component);
        function KeyboardInput() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = KeyboardInput.prototype;
        _proto.onEnable = function onEnable() {
          input.on(Input.EventType.KEY_DOWN, this._onKeyDown, this);
          input.on(Input.EventType.KEY_UP, this._onKeyUp, this);
        };
        _proto.onDisable = function onDisable() {
          input.off(Input.EventType.KEY_DOWN, this._onKeyDown, this);
          input.off(Input.EventType.KEY_UP, this._onKeyUp, this);
        };
        _proto._onKeyDown = function _onKeyDown(event) {
          inputState.setKey(event.keyCode, true);
        };
        _proto._onKeyUp = function _onKeyUp(event) {
          inputState.setKey(event.keyCode, false);
        };
        return KeyboardInput;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelData.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('assertLevel', assertLevel);
      cclegacy._RF.push({}, "e7c3dkaK09OCJxtGlt+DyxI", "LevelData", undefined);
      /** 手摆 3 屏竖井。格子边长按 DW-13 写成 8px；总高 852px = 106.5 格，上限取 106 格。 */
      var LEVEL_COLS = exports('LEVEL_COLS', 20);
      var LEVEL_ROWS = exports('LEVEL_ROWS', 106);
      var TILE_PX = 8;
      var WALL_THICKNESS = 4;
      var FLOOR_START_ROW = 100;
      var PLAYABLE_COL0 = WALL_THICKNESS;
      var PLAYABLE_COL1 = LEVEL_COLS - WALL_THICKNESS - 1; // 15

      function buildLevelGrid() {
        var grid = [];
        for (var row = 0; row < LEVEL_ROWS; row++) {
          var cells = [];
          for (var col = 0; col < LEVEL_COLS; col++) {
            var isWall = col < WALL_THICKNESS || col > PLAYABLE_COL1;
            var isFloor = row >= FLOOR_START_ROW;
            cells.push(isWall || isFloor ? 1 : 0);
          }
          grid.push(cells);
        }
        // 从第 45 行起每隔约 20 行一层实心平台，左右交替，中间留缺口。
        placePlatform(grid, 45, 'left', 5);
        placePlatform(grid, 65, 'right', 5);
        placePlatform(grid, 85, 'left', 4);
        return grid;
      }
      function placePlatform(grid, row, side, length) {
        if (side === 'left') {
          for (var i = 0; i < length; i++) {
            grid[row][PLAYABLE_COL0 + i] = 1;
          }
          return;
        }
        for (var _i = 0; _i < length; _i++) {
          grid[row][PLAYABLE_COL1 - _i] = 1;
        }
      }
      var LEVEL_GRID = exports('LEVEL_GRID', buildLevelGrid());

      /** 出生点：第 4 行、水平居中。坐标原点在井顶左上角，y 向下为负。 */
      var SPAWN_POS = exports('SPAWN_POS', {
        x: LEVEL_COLS * TILE_PX / 2,
        y: -4 * TILE_PX
      });
      function assertLevel() {
        var spawnCol = Math.floor(SPAWN_POS.x / TILE_PX);
        var spawnRow = Math.floor(-SPAWN_POS.y / TILE_PX);
        if (spawnRow < 0 || spawnRow >= LEVEL_ROWS || spawnCol < 0 || spawnCol >= LEVEL_COLS) {
          console.error("[LevelData] spawn out of bounds at row " + spawnRow + " col " + spawnCol);
        } else if (LEVEL_GRID[spawnRow][spawnCol] === 1) {
          console.error("[LevelData] spawn sits in solid at row " + spawnRow + " col " + spawnCol);
        }
        for (var row = 0; row < FLOOR_START_ROW; row++) {
          var empty = 0;
          var solid = 0;
          for (var col = PLAYABLE_COL0; col <= PLAYABLE_COL1; col++) {
            if (LEVEL_GRID[row][col] === 1) {
              solid += 1;
            } else {
              empty += 1;
            }
          }
          if (solid > 0 && empty < 4) {
            console.error("[LevelData] platform gap < 4 tiles at row " + row + " (empty=" + empty + ")");
          }
        }
      }
      assertLevel();
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Graphics, Color, Component, getTuning, assertLevel, LEVEL_GRID;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Graphics = module.Graphics;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      assertLevel = module.assertLevel;
      LEVEL_GRID = module.LEVEL_GRID;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "b4a195sjS9McaPlnwttTCoX", "LevelView", undefined);
      var ccclass = _decorator.ccclass;
      var LevelView = exports('LevelView', (_dec = ccclass('LevelView'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LevelView, _Component);
        function LevelView() {
          return _Component.apply(this, arguments) || this;
        }
        var _proto = LevelView.prototype;
        _proto.onLoad = function onLoad() {
          assertLevel();
          var graphics = this.getComponent(Graphics);
          if (!graphics) {
            console.error('[LevelView] Graphics component missing on Level');
            return;
          }
          var tileSize = getTuning().level.tileSize;
          graphics.fillColor = new Color(0x3a, 0x3a, 0x44, 255);
          for (var row = 0; row < LEVEL_GRID.length; row++) {
            var cells = LEVEL_GRID[row];
            for (var col = 0; col < cells.length; col++) {
              if (cells[col] !== 1) {
                continue;
              }
              graphics.fillRect(col * tileSize, -row * tileSize, tileSize, -tileSize);
            }
          }
        };
        return LevelView;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./FixedStepDriver.ts', './InputState.ts', './KeyboardInput.ts', './TuningConfig.ts', './ViewBootstrap.ts', './stepAccumulator.ts', './Bullet.ts', './BulletPool.ts', './Enemy.ts', './EnemyManager.ts', './Gunboots.ts', './LevelData.ts', './LevelView.ts', './PlayerController.ts', './PlayerHealth.ts', './WorldScroll.ts', './ChargeBar.ts', './DebugOverlay.ts', './DebugOverlayLoader.ts', './GameOver.ts', './HeartHud.ts', './TouchControls.ts', './TouchPad.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/PlayerController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './InputState.ts', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Sprite, find, assetManager, SpriteFrame, UITransform, Component, FixedStepDriver, inputState, initTuning, getTuning, SPAWN_POS, LEVEL_GRID, LEVEL_COLS, LEVEL_ROWS;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Sprite = module.Sprite;
      find = module.find;
      assetManager = module.assetManager;
      SpriteFrame = module.SpriteFrame;
      UITransform = module.UITransform;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      inputState = module.inputState;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      SPAWN_POS = module.SPAWN_POS;
      LEVEL_GRID = module.LEVEL_GRID;
      LEVEL_COLS = module.LEVEL_COLS;
      LEVEL_ROWS = module.LEVEL_ROWS;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "5d8c28anjtKBrfELh+dimsw", "PlayerController", undefined);
      var ccclass = _decorator.ccclass;
      var EPS = 1e-4;
      var PlayerController = exports('PlayerController', (_dec = ccclass('PlayerController'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(PlayerController, _Component);
        function PlayerController() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._x = 0;
          _this._y = 0;
          _this._vx = 0;
          _this._vy = 0;
          _this._onGround = false;
          _this._stepBound = false;
          _this._sprite = null;
          _this._idleFrame = null;
          _this._airFrame = null;
          _this._spriteGrounded = true;
          _this.firingHeld = false;
          _this.controlsLocked = false;
          _this._knockbackSteps = 0;
          return _this;
        }
        var _proto = PlayerController.prototype;
        _proto.onLoad = function onLoad() {
          void initTuning();
          this._x = SPAWN_POS.x;
          this._y = SPAWN_POS.y;
          this._applyBodySize();
          this.node.setPosition(this._x, this._y);
          this._sprite = this.getComponent(Sprite);
          this._loadPlayerSprites();
          if (typeof window !== 'undefined') {
            window.__dwPlayer = this;
          }
        };
        _proto.onEnable = function onEnable() {
          this._bindStep();
        };
        _proto.debugMeasure = function debugMeasure() {
          var player = getTuning().player;
          var hz = getTuning().loop.fixedStepHz;
          var gravity = player.gravity;
          var term = player.terminalFallSpeed;
          var jumpV = player.jumpInitialSpeed;
          var accelSteps = Math.max(1, player.accelSteps);
          var dv = player.horizontalSpeed / accelSteps;
          var fallVy = 0;
          for (var i = 0; i < 10000; i++) {
            fallVy -= gravity;
            if (fallVy < -term) {
              fallVy = -term;
              break;
            }
          }
          var vx = 0;
          var target = player.horizontalSpeed;
          for (var _i = 0; _i < 100; _i++) {
            if (vx < target) {
              vx = Math.min(vx + dv, target);
            } else {
              break;
            }
          }
          var jumpVy = 0;
          var jumpY = 0;
          var grounded = true;
          for (var _i2 = 0; _i2 < 10000; _i2++) {
            jumpVy -= gravity;
            if (jumpVy < -term) {
              jumpVy = -term;
            }
            if (grounded) {
              jumpVy = jumpV;
              grounded = false;
            }
            if (_i2 > 0 && jumpVy <= 0) {
              break;
            }
            jumpY += jumpVy;
          }
          return {
            fallSpeed: Math.abs(fallVy),
            horizontalPerSec: vx * hz,
            jumpHeight: jumpY,
            onGround: this._onGround
          };
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[PlayerController] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this2.enabled && _this2.node.activeInHierarchy) {
              _this2._step();
            }
          });
          this._stepBound = true;
        };
        _proto._step = function _step() {
          var tuning = getTuning();
          var player = tuning.player;
          var tileSize = tuning.level.tileSize;
          var halfW = player.bodyWidth / 2;
          var halfH = player.bodyHeight / 2;
          var accelSteps = Math.max(1, player.accelSteps);
          var dv = player.horizontalSpeed / accelSteps;
          var targetVx = 0;
          if (this._knockbackSteps > 0) {
            this._knockbackSteps -= 1;
          } else if (!this.controlsLocked) {
            if (inputState.left && !inputState.right) {
              targetVx = -player.horizontalSpeed;
            } else if (inputState.right && !inputState.left) {
              targetVx = player.horizontalSpeed;
            }
            this._vx = this._approach(this._vx, targetVx, dv);
          }
          this._vy -= player.gravity;
          var fallCap = player.terminalFallSpeed;
          if (this.firingHeld) {
            var g = tuning.gunboots;
            fallCap = g.recoilMode === 'cap' ? player.terminalFallSpeed * g.fallSpeedFactorWhileFiring : player.terminalFallSpeed;
          }
          if (this._vy < -fallCap) {
            this._vy = -fallCap;
          }
          if (!this.controlsLocked && inputState.jumpPressed && this._onGround) {
            this._vy = player.jumpInitialSpeed;
            this._onGround = false;
          }
          if (!this.controlsLocked && !inputState.jumpHeld && this._vy > 0 && player.jumpReleaseMode === 'cut') {
            this._vy = 0;
          }
          var moveX = this._vx;
          this._x += moveX;
          this._separateAxis(tileSize, halfW, halfH, true, moveX, 0);
          var moveY = this._vy;
          this._y += moveY;
          this._onGround = false;
          this._separateAxis(tileSize, halfW, halfH, false, 0, moveY);
          this.node.setPosition(this._x, this._y);
          this._updateGroundSprite();
          inputState.consumeEdges();
        };
        _proto._loadPlayerSprites = function _loadPlayerSprites() {
          var _this3 = this;
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[PlayerController] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.load('sprite/player/idle_00/spriteFrame', SpriteFrame, function (idleErr, idle) {
              if (idleErr || !idle) {
                console.error('[PlayerController] bundle.load failed path=sprite/player/idle_00/spriteFrame', idleErr);
                return;
              }
              _this3._idleFrame = idle;
              if (_this3._onGround) {
                _this3._applyGroundSprite(true);
              }
            });
            bundle.load('sprite/player/air_00/spriteFrame', SpriteFrame, function (airErr, air) {
              if (airErr || !air) {
                console.error('[PlayerController] bundle.load failed path=sprite/player/air_00/spriteFrame', airErr);
                return;
              }
              _this3._airFrame = air;
              if (!_this3._onGround) {
                _this3._applyGroundSprite(false);
              }
            });
          });
        };
        _proto._updateGroundSprite = function _updateGroundSprite() {
          if (this._onGround === this._spriteGrounded) {
            return;
          }
          this._applyGroundSprite(this._onGround);
        };
        _proto._applyGroundSprite = function _applyGroundSprite(onGround) {
          this._spriteGrounded = onGround;
          if (!this._sprite) {
            return;
          }
          var frame = onGround ? this._idleFrame : this._airFrame;
          if (frame) {
            this._sprite.spriteFrame = frame;
          }
        };
        _proto._approach = function _approach(current, target, maxDelta) {
          if (current < target) {
            return Math.min(current + maxDelta, target);
          }
          if (current > target) {
            return Math.max(current - maxDelta, target);
          }
          return target;
        };
        _proto._separateAxis = function _separateAxis(tileSize, halfW, halfH, horizontal, moveX, moveY) {
          var left = this._x - halfW;
          var right = this._x + halfW;
          var bottom = this._y - halfH;
          var top = this._y + halfH;
          var col0 = Math.max(0, Math.floor(left / tileSize));
          var col1 = Math.min(LEVEL_COLS - 1, Math.floor((right - EPS) / tileSize));
          var row0 = Math.max(0, Math.floor(-top / tileSize));
          var row1 = Math.min(LEVEL_ROWS - 1, Math.floor((-bottom - EPS) / tileSize));
          var hit = false;
          for (var row = row0; row <= row1; row++) {
            for (var col = col0; col <= col1; col++) {
              if (LEVEL_GRID[row][col] !== 1) {
                continue;
              }
              var tileLeft = col * tileSize;
              var tileRight = (col + 1) * tileSize;
              var tileTop = -row * tileSize;
              var tileBottom = -(row + 1) * tileSize;
              if (horizontal) {
                if (moveX > 0) {
                  this._x = Math.min(this._x, tileLeft - halfW);
                  hit = true;
                } else if (moveX < 0) {
                  this._x = Math.max(this._x, tileRight + halfW);
                  hit = true;
                }
              } else if (moveY < 0) {
                this._y = Math.max(this._y, tileTop + halfH);
                this._onGround = true;
                hit = true;
              } else if (moveY > 0) {
                this._y = Math.min(this._y, tileBottom - halfH);
                hit = true;
              }
            }
          }
          if (hit) {
            if (horizontal) {
              this._vx = 0;
            } else {
              this._vy = 0;
            }
          }
        };
        _proto.applyHurtKnockback = function applyHurtKnockback(fromX) {
          var h = getTuning().health;
          var dir = this._x >= fromX ? 1 : -1;
          this._vx = dir * h.knockbackVx;
          this._vy = h.knockbackVy;
          this._onGround = false;
          this._knockbackSteps = 6;
        };
        _proto.applyRecoil = function applyRecoil(_gunboots) {
          var g = getTuning().gunboots;
          this._vy += g.recoilImpulse;
          if (g.recoilMode === 'cap') {
            this._vy += g.recoilPop;
          }
          this._vy = Math.min(this._vy, g.recoilMaxRise);
          this._onGround = false;
        };
        _proto._applyBodySize = function _applyBodySize() {
          var ut = this.getComponent(UITransform);
          if (!ut) {
            return;
          }
          var player = getTuning().player;
          ut.setContentSize(player.bodyWidth, player.bodyHeight);
        };
        _createClass(PlayerController, [{
          key: "_leftHeld",
          get: function get() {
            return inputState.left;
          },
          set: function set(value) {
            inputState.debugSet({
              left: value
            });
          }
        }, {
          key: "_rightHeld",
          get: function get() {
            return inputState.right;
          },
          set: function set(value) {
            inputState.debugSet({
              right: value
            });
          }
        }, {
          key: "_jumpHeld",
          get: function get() {
            return inputState.jumpHeld;
          },
          set: function set(value) {
            inputState.debugSet({
              jumpHeld: value
            });
          }
        }, {
          key: "position",
          get: function get() {
            return {
              x: this._x,
              y: this._y
            };
          }
        }, {
          key: "velocity",
          get: function get() {
            return {
              x: this._vx,
              y: this._vy
            };
          }
        }, {
          key: "onGround",
          get: function get() {
            return this._onGround;
          }
        }]);
        return PlayerController;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PlayerHealth.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts', './PlayerController.ts', './GameOver.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Sprite, find, Component, FixedStepDriver, initTuning, getTuning, PlayerController, GameOver;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Sprite = module.Sprite;
      find = module.find;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      PlayerController = module.PlayerController;
    }, function (module) {
      GameOver = module.GameOver;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e7f8akBI0VGeJq83vASNFZ4", "PlayerHealth", undefined);
      var ccclass = _decorator.ccclass;
      var PlayerHealth = exports('PlayerHealth', (_dec = ccclass('PlayerHealth'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(PlayerHealth, _Component);
        function PlayerHealth() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._hp = 0;
          _this._dead = false;
          _this.invulnLeft = 0;
          _this._stepBound = false;
          _this._sprite = null;
          _this._spriteFlashOn = true;
          return _this;
        }
        var _proto = PlayerHealth.prototype;
        _proto.onLoad = function onLoad() {
          void initTuning();
          this._hp = this.maxHp;
          this.invulnLeft = 0;
          this._sprite = this.getComponent(Sprite);
          if (typeof window !== 'undefined') {
            window.__dwHealth = this;
          }
        };
        _proto.onEnable = function onEnable() {
          this._bindStep();
        };
        _proto.takeDamage = function takeDamage(n, fromX) {
          var _find;
          if (this.invulnLeft > 0 || this.isDead) {
            return false;
          }
          this._hp -= n;
          this.invulnLeft = getTuning().health.invulnSteps;
          var ctrl = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(PlayerController);
          ctrl == null || ctrl.applyHurtKnockback(fromX);
          if (this._hp <= 0) {
            var _find2;
            this._dead = true;
            console.log('[PlayerHealth] dead hp=' + this._hp);
            if (ctrl) {
              ctrl.controlsLocked = true;
            }
            (_find2 = find('Canvas/GameOver')) == null || (_find2 = _find2.getComponent(GameOver)) == null || _find2.show();
          }
          return true;
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[PlayerHealth] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this2.enabled && _this2.node.activeInHierarchy) {
              _this2._onStep();
            }
          });
          this._stepBound = true;
        };
        _proto._onStep = function _onStep() {
          if (this.invulnLeft > 0) {
            this.invulnLeft -= 1;
            var shouldShow = this.invulnLeft % 8 < 4;
            if (shouldShow !== this._spriteFlashOn) {
              this._spriteFlashOn = shouldShow;
              if (this._sprite) {
                this._sprite.enabled = shouldShow;
              }
            }
            if (this.invulnLeft === 0) {
              this._spriteFlashOn = true;
              if (this._sprite) {
                this._sprite.enabled = true;
              }
            }
          }
        };
        _createClass(PlayerHealth, [{
          key: "hp",
          get: function get() {
            return this._hp;
          }
        }, {
          key: "maxHp",
          get: function get() {
            return getTuning().health.maxHp;
          }
        }, {
          key: "invulnerable",
          get: function get() {
            return this.invulnLeft > 0;
          }
        }, {
          key: "isDead",
          get: function get() {
            return this._dead;
          }
        }]);
        return PlayerHealth;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/stepAccumulator.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('advance', advance);
      cclegacy._RF.push({}, "c3e8aG0fy1MWZ4WigtNfzHC", "stepAccumulator", undefined);
      /** 浮点累加容差：避免 60 帧/秒整倍循环时少算 1 步 */
      var STEP_EPS_MS = exports('STEP_EPS_MS', 1e-6);
      function advance(accMs, stepMs, elapsedMs, maxCatchUp) {
        var nextAcc = accMs;
        if (elapsedMs > 0) {
          nextAcc += elapsedMs;
        }
        var steps = 0;
        while (nextAcc >= (steps + 1) * stepMs - STEP_EPS_MS && steps < maxCatchUp) {
          steps += 1;
        }
        nextAcc -= steps * stepMs;
        var dropped = 0;
        if (nextAcc >= stepMs - STEP_EPS_MS) {
          dropped = Math.floor(nextAcc / stepMs);
          nextAcc = 0;
        }
        return {
          accMs: nextAcc,
          steps: steps,
          dropped: dropped
        };
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TouchControls.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './InputState.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, UITransform, Graphics, Color, Vec3, Component, inputState;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Color = module.Color;
      Vec3 = module.Vec3;
      Component = module.Component;
    }, function (module) {
      inputState = module.inputState;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "f9a5bPCTW5PcKEjRWeJq83v", "TouchControls", undefined);
      var ccclass = _decorator.ccclass;
      var BUTTON_MAP = [{
        path: 'BtnLeft',
        button: 'left'
      }, {
        path: 'BtnRight',
        button: 'right'
      }, {
        path: 'BtnFire',
        button: 'fire'
      }, {
        path: 'BtnJump',
        button: 'jump'
      }];
      var TouchControls = exports('TouchControls', (_dec = ccclass('TouchControls'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TouchControls, _Component);
        function TouchControls() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._normalScale = new Vec3(1, 1, 1);
          _this._pressedScale = new Vec3(0.9, 0.9, 1);
          _this._buttonNodes = new Map();
          return _this;
        }
        var _proto = TouchControls.prototype;
        _proto.onLoad = function onLoad() {
          for (var _i = 0, _BUTTON_MAP = BUTTON_MAP; _i < _BUTTON_MAP.length; _i++) {
            var _BUTTON_MAP$_i = _BUTTON_MAP[_i],
              path = _BUTTON_MAP$_i.path,
              button = _BUTTON_MAP$_i.button;
            var node = this.node.getChildByPath(path);
            if (!node) {
              console.error("[TouchControls] missing child path=" + path);
              continue;
            }
            this._buttonNodes.set(button, node);
            this._drawButtonGraphics(node);
          }
        };
        _proto.onDisable = function onDisable() {
          for (var _iterator = _createForOfIteratorHelperLoose(this._buttonNodes.keys()), _step; !(_step = _iterator()).done;) {
            var button = _step.value;
            this.setPressed(button, false);
          }
          inputState.reset();
        };
        _proto.setPressed = function setPressed(btn, down) {
          var node = this._buttonNodes.get(btn);
          if (!node) {
            return;
          }
          node.setScale(down ? this._pressedScale : this._normalScale);
        };
        _proto._drawButtonGraphics = function _drawButtonGraphics(node) {
          var ut = node.getComponent(UITransform);
          var g = node.getComponent(Graphics);
          if (!ut || !g) {
            console.error("[TouchControls] missing UITransform/Graphics on " + node.name);
            return;
          }
          var hw = ut.width / 2;
          var hh = ut.height / 2;
          g.clear();
          g.fillColor = new Color(255, 255, 255, 46);
          g.roundRect(-hw, -hh, ut.width, ut.height, 6);
          g.fill();
          g.strokeColor = new Color(255, 255, 255, 90);
          g.lineWidth = 1;
          g.roundRect(-hw, -hh, ut.width, ut.height, 6);
          g.stroke();
        };
        return TouchControls;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TouchPad.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './InputState.ts', './TouchControls.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, find, UITransform, Component, getTuning, inputState, TouchControls;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      UITransform = module.UITransform;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      inputState = module.inputState;
    }, function (module) {
      TouchControls = module.TouchControls;
    }],
    execute: function () {
      exports('toDesign', toDesign);
      var _dec, _class;
      cclegacy._RF.push({}, "b2d4eb4GjxefZsKLE1ujwoc", "TouchPad", undefined);
      var ccclass = _decorator.ccclass;
      var BUTTON_NAMES = [{
        name: 'BtnLeft',
        button: 'left'
      }, {
        name: 'BtnRight',
        button: 'right'
      }, {
        name: 'BtnFire',
        button: 'fire'
      }, {
        name: 'BtnJump',
        button: 'jump'
      }];
      var HIT_SLOP = 4;
      var MOUSE_ID = -1;
      /** canvasRect: getBoundingClientRect(); dw/dh 来自 getTuning().render */
      function toDesign(clientX, clientY, canvasRect, dw, dh) {
        var u = (clientX - canvasRect.left) / canvasRect.width;
        var v = (clientY - canvasRect.top) / canvasRect.height;
        var x = u * dw;
        var y = dh * (1 - v);
        return {
          x: x,
          y: y,
          u: u,
          v: v
        };
      }
      var TouchPad = exports('TouchPad', (_dec = ccclass('TouchPad'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(TouchPad, _Component);
        function TouchPad() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._touchMap = new Map();
          _this._mouseDown = false;
          /** capture: Cocos 在 canvas 冒泡阶段 stopPropagation，只有捕获阶段能收到 */
          _this._listenerOpts = {
            capture: true,
            passive: false
          };
          _this._onTouchStart = function (event) {
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i += 1) {
              var t = event.changedTouches[i];
              _this._updatePointer(t.identifier, t.clientX, t.clientY);
            }
          };
          _this._onTouchMove = function (event) {
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i += 1) {
              var t = event.changedTouches[i];
              _this._updatePointer(t.identifier, t.clientX, t.clientY);
            }
          };
          _this._onTouchEnd = function (event) {
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i += 1) {
              var t = event.changedTouches[i];
              _this._releasePointer(t.identifier);
            }
          };
          _this._onTouchCancel = function (event) {
            event.preventDefault();
            for (var i = 0; i < event.changedTouches.length; i += 1) {
              var t = event.changedTouches[i];
              _this._releasePointer(t.identifier);
            }
          };
          _this._onMouseDown = function (event) {
            if (event.button !== 0) {
              return;
            }
            event.preventDefault();
            _this._mouseDown = true;
            _this._updatePointer(MOUSE_ID, event.clientX, event.clientY);
          };
          _this._onMouseMove = function (event) {
            if (!_this._mouseDown) {
              return;
            }
            event.preventDefault();
            _this._updatePointer(MOUSE_ID, event.clientX, event.clientY);
          };
          _this._onMouseUp = function (event) {
            if (event.button !== 0) {
              return;
            }
            event.preventDefault();
            _this._mouseDown = false;
            _this._releasePointer(MOUSE_ID);
          };
          return _this;
        }
        var _proto = TouchPad.prototype;
        _proto.onEnable = function onEnable() {
          if (typeof window === 'undefined') {
            return;
          }
          window.addEventListener('touchstart', this._onTouchStart, this._listenerOpts);
          window.addEventListener('touchmove', this._onTouchMove, this._listenerOpts);
          window.addEventListener('touchend', this._onTouchEnd, this._listenerOpts);
          window.addEventListener('touchcancel', this._onTouchCancel, this._listenerOpts);
          window.addEventListener('mousedown', this._onMouseDown, this._listenerOpts);
          window.addEventListener('mousemove', this._onMouseMove, this._listenerOpts);
          window.addEventListener('mouseup', this._onMouseUp, this._listenerOpts);
        };
        _proto.onDisable = function onDisable() {
          if (typeof window === 'undefined') {
            return;
          }
          window.removeEventListener('touchstart', this._onTouchStart, this._listenerOpts);
          window.removeEventListener('touchmove', this._onTouchMove, this._listenerOpts);
          window.removeEventListener('touchend', this._onTouchEnd, this._listenerOpts);
          window.removeEventListener('touchcancel', this._onTouchCancel, this._listenerOpts);
          window.removeEventListener('mousedown', this._onMouseDown, this._listenerOpts);
          window.removeEventListener('mousemove', this._onMouseMove, this._listenerOpts);
          window.removeEventListener('mouseup', this._onMouseUp, this._listenerOpts);
          this._releaseAllTouches();
        };
        _proto._releaseAllTouches = function _releaseAllTouches() {
          for (var _iterator = _createForOfIteratorHelperLoose(this._touchMap.values()), _step; !(_step = _iterator()).done;) {
            var btn = _step.value;
            if (btn) {
              this._setButtonDown(btn, false);
            }
          }
          this._touchMap.clear();
          this._mouseDown = false;
        };
        _proto._releasePointer = function _releasePointer(id) {
          var prev = this._touchMap.get(id);
          if (prev) {
            this._setButtonDown(prev, false);
          }
          this._touchMap["delete"](id);
        };
        _proto._updatePointer = function _updatePointer(id, clientX, clientY) {
          var _this$_touchMap$get;
          var canvas = document.getElementById('GameCanvas');
          if (!(canvas instanceof HTMLCanvasElement)) {
            return;
          }
          var rect = canvas.getBoundingClientRect();
          var render = getTuning().render;
          var pt = toDesign(clientX, clientY, rect, render.designWidth, render.designHeight);
          if (pt.u < 0 || pt.u > 1 || pt.v < 0 || pt.v > 1) {
            this._releasePointer(id);
            return;
          }
          var hit = this._hitTest(pt.x, pt.y);
          var prev = (_this$_touchMap$get = this._touchMap.get(id)) != null ? _this$_touchMap$get : null;
          if (prev === hit) {
            if (!this._touchMap.has(id)) {
              this._touchMap.set(id, hit);
              if (hit) {
                this._setButtonDown(hit, true);
              }
            }
            return;
          }
          if (prev) {
            this._setButtonDown(prev, false);
          }
          if (hit) {
            this._setButtonDown(hit, true);
          }
          this._touchMap.set(id, hit);
        }

        /** 按钮矩形：worldPosition ± 半尺寸（锚点 0.5,0.5），外扩 HIT_SLOP design px。 */;
        _proto._hitTest = function _hitTest(x, y) {
          var tc = find('Canvas/TouchControls');
          if (!tc) {
            return null;
          }
          for (var _i = 0, _BUTTON_NAMES = BUTTON_NAMES; _i < _BUTTON_NAMES.length; _i++) {
            var _BUTTON_NAMES$_i = _BUTTON_NAMES[_i],
              name = _BUTTON_NAMES$_i.name,
              button = _BUTTON_NAMES$_i.button;
            var n = tc.getChildByName(name);
            if (!n) {
              continue;
            }
            var ut = n.getComponent(UITransform);
            if (!ut) {
              continue;
            }
            var wp = n.worldPosition;
            var hw = ut.width / 2 + HIT_SLOP;
            var hh = ut.height / 2 + HIT_SLOP;
            if (x >= wp.x - hw && x <= wp.x + hw && y >= wp.y - hh && y <= wp.y + hh) {
              return button;
            }
          }
          return null;
        };
        _proto._setButtonDown = function _setButtonDown(btn, down) {
          var _find;
          inputState.setTouch(btn, down);
          (_find = find('Canvas/TouchControls')) == null || (_find = _find.getComponent(TouchControls)) == null || _find.setPressed(btn, down);
        };
        return TouchPad;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/TuningConfig.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _asyncToGenerator, _regeneratorRuntime, cclegacy;
  return {
    setters: [function (module) {
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        getTuning: getTuning,
        getTuningSource: getTuningSource,
        initTuning: initTuning
      });
      cclegacy._RF.push({}, "a082dxZE8hOpojXvUACnqxw", "TuningConfig", undefined);
      /** tuning.json 里每个可调参数的包装结构；运行时只取 value。 */
      /** 摊平后的运行时配置：只保留 value。 */
      var FETCH_TIMEOUT_MS = 2000;
      var TUNING_URL = 'tuning.json';
      var DEFAULT_TUNING = {
        loop: {
          fixedStepHz: 60,
          maxCatchUpSteps: 5
        },
        render: {
          designWidth: 160,
          designHeight: 284,
          pixelScale: 2
        },
        player: {
          bodyWidth: 24,
          bodyHeight: 24,
          terminalFallSpeed: 4.7333,
          gravity: 0.4,
          horizontalSpeed: 1.2,
          accelSteps: 3,
          jumpInitialSpeed: 6.1968,
          jumpReleaseMode: 'cut'
        },
        level: {
          tileSize: 8,
          wellWidthTiles: 20,
          wallThicknessTiles: 4
        },
        gunboots: {
          fireIntervalSteps: 8,
          bulletSpeed: 9,
          bulletLifeSteps: 40,
          bulletWidth: 3,
          bulletHeight: 6,
          chargeMax: 8,
          chargeCostPerShot: 1,
          rechargeDelaySteps: 45,
          rechargeStepsPerCell: 12,
          recoilMode: 'cap',
          fallSpeedFactorWhileFiring: 0.45,
          recoilPop: 0.55,
          recoilMaxRise: 2.0,
          recoilImpulse: 3.4
        },
        health: {
          maxHp: 4,
          invulnSteps: 36,
          knockbackVx: 1.6,
          knockbackVy: 2.2,
          deathRestartDelaySteps: 30
        }
      };
      var current = cloneTuning(DEFAULT_TUNING);
      var source = 'default';
      var initPromise = null;
      function getTuning() {
        return cloneTuning(current);
      }
      function getTuningSource() {
        return source;
      }

      /** 幂等：多次调用共享同一次加载，失败时落到 DEFAULT_TUNING，绝不抛异常。 */
      function initTuning() {
        if (!initPromise) {
          initPromise = loadTuning();
        }
        return initPromise;
      }
      function cloneTuning(tuning) {
        return {
          loop: {
            fixedStepHz: tuning.loop.fixedStepHz,
            maxCatchUpSteps: tuning.loop.maxCatchUpSteps
          },
          render: {
            designWidth: tuning.render.designWidth,
            designHeight: tuning.render.designHeight,
            pixelScale: tuning.render.pixelScale
          },
          player: {
            bodyWidth: tuning.player.bodyWidth,
            bodyHeight: tuning.player.bodyHeight,
            terminalFallSpeed: tuning.player.terminalFallSpeed,
            gravity: tuning.player.gravity,
            horizontalSpeed: tuning.player.horizontalSpeed,
            accelSteps: tuning.player.accelSteps,
            jumpInitialSpeed: tuning.player.jumpInitialSpeed,
            jumpReleaseMode: tuning.player.jumpReleaseMode
          },
          level: {
            tileSize: tuning.level.tileSize,
            wellWidthTiles: tuning.level.wellWidthTiles,
            wallThicknessTiles: tuning.level.wallThicknessTiles
          },
          gunboots: {
            fireIntervalSteps: tuning.gunboots.fireIntervalSteps,
            bulletSpeed: tuning.gunboots.bulletSpeed,
            bulletLifeSteps: tuning.gunboots.bulletLifeSteps,
            bulletWidth: tuning.gunboots.bulletWidth,
            bulletHeight: tuning.gunboots.bulletHeight,
            chargeMax: tuning.gunboots.chargeMax,
            chargeCostPerShot: tuning.gunboots.chargeCostPerShot,
            rechargeDelaySteps: tuning.gunboots.rechargeDelaySteps,
            rechargeStepsPerCell: tuning.gunboots.rechargeStepsPerCell,
            recoilMode: tuning.gunboots.recoilMode,
            fallSpeedFactorWhileFiring: tuning.gunboots.fallSpeedFactorWhileFiring,
            recoilPop: tuning.gunboots.recoilPop,
            recoilMaxRise: tuning.gunboots.recoilMaxRise,
            recoilImpulse: tuning.gunboots.recoilImpulse
          },
          health: {
            maxHp: tuning.health.maxHp,
            invulnSteps: tuning.health.invulnSteps,
            knockbackVx: tuning.health.knockbackVx,
            knockbackVy: tuning.health.knockbackVy,
            deathRestartDelaySteps: tuning.health.deathRestartDelaySteps
          }
        };
      }
      function loadTuning() {
        return _loadTuning.apply(this, arguments);
      }
      function _loadTuning() {
        _loadTuning = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
          var raw;
          return _regeneratorRuntime().wrap(function _callee$(_context) {
            while (1) switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return fetchTuningJson();
              case 3:
                raw = _context.sent;
                current = flattenTuning(raw);
                source = 'fetched';
                _context.next = 13;
                break;
              case 8:
                _context.prev = 8;
                _context.t0 = _context["catch"](0);
                current = cloneTuning(DEFAULT_TUNING);
                source = 'default';
                console.warn('[tuning] fallback to defaults', _context.t0);
              case 13:
                console.log('[tuning]', getTuningSource(), JSON.stringify(getTuning()));
                return _context.abrupt("return", getTuning());
              case 15:
              case "end":
                return _context.stop();
            }
          }, _callee, null, [[0, 8]]);
        }));
        return _loadTuning.apply(this, arguments);
      }
      function fetchTuningJson() {
        return _fetchTuningJson.apply(this, arguments);
      }
      function _fetchTuningJson() {
        _fetchTuningJson = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee2() {
          var controller, timer, response, data;
          return _regeneratorRuntime().wrap(function _callee2$(_context2) {
            while (1) switch (_context2.prev = _context2.next) {
              case 0:
                controller = new AbortController();
                timer = setTimeout(function () {
                  return controller.abort();
                }, FETCH_TIMEOUT_MS);
                _context2.prev = 2;
                _context2.next = 5;
                return fetch(TUNING_URL, {
                  cache: 'no-store',
                  signal: controller.signal
                });
              case 5:
                response = _context2.sent;
                if (response.ok) {
                  _context2.next = 8;
                  break;
                }
                throw new Error("HTTP " + response.status + " " + response.statusText);
              case 8:
                _context2.next = 10;
                return response.json();
              case 10:
                data = _context2.sent;
                return _context2.abrupt("return", data);
              case 12:
                _context2.prev = 12;
                clearTimeout(timer);
                return _context2.finish(12);
              case 15:
              case "end":
                return _context2.stop();
            }
          }, _callee2, null, [[2,, 12, 15]]);
        }));
        return _fetchTuningJson.apply(this, arguments);
      }
      function flattenTuning(raw) {
        if (!isRecord(raw)) {
          throw new Error('tuning.json root is not an object');
        }
        if (!isRecord(raw.loop)) {
          throw new Error('missing loop');
        }
        if (!isRecord(raw.render)) {
          throw new Error('missing render');
        }
        if (!isRecord(raw.player)) {
          throw new Error('missing player');
        }
        if (!isRecord(raw.level)) {
          throw new Error('missing level');
        }
        if (!isRecord(raw.gunboots)) {
          throw new Error('missing gunboots');
        }
        var healthRaw = isRecord(raw.health) ? raw.health : null;
        return {
          loop: {
            fixedStepHz: readNumberValue(raw.loop.fixedStepHz, 'loop.fixedStepHz'),
            maxCatchUpSteps: readNumberValue(raw.loop.maxCatchUpSteps, 'loop.maxCatchUpSteps')
          },
          render: {
            designWidth: readNumberValue(raw.render.designWidth, 'render.designWidth'),
            designHeight: readNumberValue(raw.render.designHeight, 'render.designHeight'),
            pixelScale: readNumberValue(raw.render.pixelScale, 'render.pixelScale')
          },
          player: {
            bodyWidth: readNumberValue(raw.player.bodyWidth, 'player.bodyWidth'),
            bodyHeight: readNumberValue(raw.player.bodyHeight, 'player.bodyHeight'),
            terminalFallSpeed: readNumberValue(raw.player.terminalFallSpeed, 'player.terminalFallSpeed'),
            gravity: readNumberValue(raw.player.gravity, 'player.gravity'),
            horizontalSpeed: readNumberValue(raw.player.horizontalSpeed, 'player.horizontalSpeed'),
            accelSteps: readNumberValue(raw.player.accelSteps, 'player.accelSteps'),
            jumpInitialSpeed: readNumberValue(raw.player.jumpInitialSpeed, 'player.jumpInitialSpeed'),
            jumpReleaseMode: readStringValue(raw.player.jumpReleaseMode, 'player.jumpReleaseMode')
          },
          level: {
            tileSize: readNumberValue(raw.level.tileSize, 'level.tileSize'),
            wellWidthTiles: readNumberValue(raw.level.wellWidthTiles, 'level.wellWidthTiles'),
            wallThicknessTiles: readNumberValue(raw.level.wallThicknessTiles, 'level.wallThicknessTiles')
          },
          gunboots: {
            fireIntervalSteps: readNumberValue(raw.gunboots.fireIntervalSteps, 'gunboots.fireIntervalSteps'),
            bulletSpeed: readNumberValue(raw.gunboots.bulletSpeed, 'gunboots.bulletSpeed'),
            bulletLifeSteps: readNumberValue(raw.gunboots.bulletLifeSteps, 'gunboots.bulletLifeSteps'),
            bulletWidth: readNumberValue(raw.gunboots.bulletWidth, 'gunboots.bulletWidth'),
            bulletHeight: readNumberValue(raw.gunboots.bulletHeight, 'gunboots.bulletHeight'),
            chargeMax: readNumberValue(raw.gunboots.chargeMax, 'gunboots.chargeMax'),
            chargeCostPerShot: readNumberValue(raw.gunboots.chargeCostPerShot, 'gunboots.chargeCostPerShot'),
            rechargeDelaySteps: readNumberValue(raw.gunboots.rechargeDelaySteps, 'gunboots.rechargeDelaySteps'),
            rechargeStepsPerCell: readNumberValue(raw.gunboots.rechargeStepsPerCell, 'gunboots.rechargeStepsPerCell'),
            recoilMode: readStringValue(raw.gunboots.recoilMode, 'gunboots.recoilMode'),
            fallSpeedFactorWhileFiring: readNumberValue(raw.gunboots.fallSpeedFactorWhileFiring, 'gunboots.fallSpeedFactorWhileFiring'),
            recoilPop: readNumberValue(raw.gunboots.recoilPop, 'gunboots.recoilPop'),
            recoilMaxRise: readNumberValue(raw.gunboots.recoilMaxRise, 'gunboots.recoilMaxRise'),
            recoilImpulse: readNumberValue(raw.gunboots.recoilImpulse, 'gunboots.recoilImpulse')
          },
          health: {
            maxHp: healthRaw ? readNumberValue(healthRaw.maxHp, 'health.maxHp') : DEFAULT_TUNING.health.maxHp,
            invulnSteps: healthRaw ? readNumberValue(healthRaw.invulnSteps, 'health.invulnSteps') : DEFAULT_TUNING.health.invulnSteps,
            knockbackVx: healthRaw ? readNumberValue(healthRaw.knockbackVx, 'health.knockbackVx') : DEFAULT_TUNING.health.knockbackVx,
            knockbackVy: healthRaw ? readNumberValue(healthRaw.knockbackVy, 'health.knockbackVy') : DEFAULT_TUNING.health.knockbackVy,
            deathRestartDelaySteps: healthRaw ? readNumberValue(healthRaw.deathRestartDelaySteps, 'health.deathRestartDelaySteps') : DEFAULT_TUNING.health.deathRestartDelaySteps
          }
        };
      }
      function readNumberValue(field, path) {
        if (!isRecord(field)) {
          throw new Error("missing " + path);
        }
        var n = Number(field.value);
        if (!Number.isFinite(n)) {
          throw new Error("missing or invalid " + path + ".value");
        }
        return n;
      }
      function readStringValue(field, path) {
        if (!isRecord(field)) {
          throw new Error("missing " + path);
        }
        if (field.value === undefined || field.value === null) {
          throw new Error("missing " + path + ".value");
        }
        return String(field.value);
      }
      function isRecord(value) {
        return typeof value === 'object' && value !== null;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ViewBootstrap.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, director, Director, view, ResolutionPolicy, Component, getTuning;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      director = module.director;
      Director = module.Director;
      view = module.view;
      ResolutionPolicy = module.ResolutionPolicy;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "724deZpTPBGOqrI80EJB5AD", "ViewBootstrap", undefined);
      var ccclass = _decorator.ccclass;
      var WATCH_FRAMES = 180;
      var RESIZE_THROTTLE_MS = 100;
      var SELF_HEAL_MS = 3000;
      var SELF_HEAL_EVERY_FRAMES = 30;
      var SCENE_ENFORCE_DELAY_MS = 200;
      var SCENE_ENFORCE_DELAY_FRAMES = 2;
      var ViewBootstrap = exports('ViewBootstrap', (_dec = ccclass('ViewBootstrap'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ViewBootstrap, _Component);
        function ViewBootstrap() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._watchStarted = false;
          _this._sceneHooked = false;
          _this._resizeHooked = false;
          _this._visibilityHooked = false;
          _this._pageshowHooked = false;
          _this._resizeTimer = null;
          _this._sceneDelayTimer = null;
          _this._lastLoggedScale = -1;
          _this._lastLoggedCanvasW = -1;
          _this._lastLoggedCanvasH = -1;
          _this._focusHooked = false;
          _this._selfHealGen = 0;
          _this._selfHealCount = 0;
          _this._onWindowResize = function () {
            if (_this._resizeTimer !== null) {
              return;
            }
            _this._resizeTimer = setTimeout(function () {
              _this._resizeTimer = null;
              _this._enforceIfAlive();
            }, RESIZE_THROTTLE_MS);
          };
          _this._onVisibilityChange = function () {
            if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
              _this._enforceIfAlive();
            }
          };
          _this._onPageShow = function (_event) {
            _this._enforceIfAlive();
          };
          _this._onPointerDownFocus = function () {
            var _document$getElementB;
            (_document$getElementB = document.getElementById('GameCanvas')) == null || _document$getElementB.focus();
          };
          return _this;
        }
        var _proto = ViewBootstrap.prototype;
        _proto.onLoad = function onLoad() {
          this._hookSceneLaunch();
          this._hookResize();
          this._hookVisibility();
          this._hookPageshow();
          this._enforce();
          this._startWatch();
          this._startSelfHeal();
        };
        _proto.onEnable = function onEnable() {
          this._enforce();
        };
        _proto.onDestroy = function onDestroy() {
          this._selfHealGen += 1;
          if (this._sceneHooked) {
            director.off(Director.EVENT_AFTER_SCENE_LAUNCH, this._onAfterSceneLaunch, this);
            this._sceneHooked = false;
          }
          if (this._resizeHooked && typeof window !== 'undefined') {
            window.removeEventListener('resize', this._onWindowResize);
            window.removeEventListener('orientationchange', this._onWindowResize);
            this._resizeHooked = false;
          }
          if (this._visibilityHooked && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this._onVisibilityChange);
            this._visibilityHooked = false;
          }
          if (this._pageshowHooked && typeof window !== 'undefined') {
            window.removeEventListener('pageshow', this._onPageShow);
            this._pageshowHooked = false;
          }
          if (this._focusHooked && typeof document !== 'undefined') {
            document.removeEventListener('pointerdown', this._onPointerDownFocus);
            this._focusHooked = false;
          }
          if (this._resizeTimer !== null) {
            clearTimeout(this._resizeTimer);
            this._resizeTimer = null;
          }
          if (this._sceneDelayTimer !== null) {
            clearTimeout(this._sceneDelayTimer);
            this._sceneDelayTimer = null;
          }
        };
        _proto._onAfterSceneLaunch = function _onAfterSceneLaunch() {
          this._enforce();
          this._enforceAfterFrames(SCENE_ENFORCE_DELAY_FRAMES);
          this._enforceAfterMs(SCENE_ENFORCE_DELAY_MS);
          this._startSelfHeal();
        };
        _proto._hookSceneLaunch = function _hookSceneLaunch() {
          if (this._sceneHooked) {
            return;
          }
          director.on(Director.EVENT_AFTER_SCENE_LAUNCH, this._onAfterSceneLaunch, this);
          this._sceneHooked = true;
        };
        _proto._hookResize = function _hookResize() {
          if (this._resizeHooked || typeof window === 'undefined') {
            return;
          }
          window.addEventListener('resize', this._onWindowResize);
          window.addEventListener('orientationchange', this._onWindowResize);
          this._resizeHooked = true;
        };
        _proto._hookVisibility = function _hookVisibility() {
          if (this._visibilityHooked || typeof document === 'undefined') {
            return;
          }
          document.addEventListener('visibilitychange', this._onVisibilityChange);
          this._visibilityHooked = true;
        };
        _proto._hookPageshow = function _hookPageshow() {
          if (this._pageshowHooked || typeof window === 'undefined') {
            return;
          }
          window.addEventListener('pageshow', this._onPageShow);
          this._pageshowHooked = true;
        };
        _proto._enforceIfAlive = function _enforceIfAlive() {
          if (!this.isValid) {
            return;
          }
          this._enforce();
        };
        _proto._enforceAfterFrames = function _enforceAfterFrames(frames) {
          var _this2 = this;
          var step = function step() {
            frames -= 1;
            if (frames <= 0) {
              _this2._enforceIfAlive();
              return;
            }
            if (typeof requestAnimationFrame === 'function') {
              requestAnimationFrame(step);
            } else {
              _this2._enforceIfAlive();
            }
          };
          if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(step);
          } else {
            this._enforceIfAlive();
          }
        };
        _proto._enforceAfterMs = function _enforceAfterMs(ms) {
          var _this3 = this;
          if (this._sceneDelayTimer !== null) {
            clearTimeout(this._sceneDelayTimer);
          }
          this._sceneDelayTimer = setTimeout(function () {
            _this3._sceneDelayTimer = null;
            _this3._enforceIfAlive();
          }, ms);
        };
        _proto._startWatch = function _startWatch() {
          var _this4 = this;
          if (this._watchStarted) {
            return;
          }
          this._watchStarted = true;
          if (typeof requestAnimationFrame !== 'function') {
            this._hookSceneLaunch();
            return;
          }
          var frames = 0;
          var tick = function tick() {
            frames += 1;
            var target = _this4._targetCanvasSize();
            if (!_this4._engineSizeMatchesTarget(target.w, target.h)) {
              _this4._enforce();
            }
            if (frames < WATCH_FRAMES) {
              requestAnimationFrame(tick);
              return;
            }
            var still = _this4._targetCanvasSize();
            if (!_this4._engineSizeMatchesTarget(still.w, still.h)) {
              var engine = _this4._engineCanvasSize();
              var w = engine ? Math.round(engine.w) : still.w;
              var h = engine ? Math.round(engine.h) : still.h;
              console.error("[ViewBootstrap] canvas size still wrong: " + w + "x" + h);
            }
            _this4._hookSceneLaunch();
          };
          requestAnimationFrame(tick);
        };
        _proto._startSelfHeal = function _startSelfHeal() {
          var _this5 = this;
          if (typeof requestAnimationFrame !== 'function') {
            return;
          }
          var gen = ++this._selfHealGen;
          var startedAt = Date.now();
          var frames = 0;
          var tick = function tick() {
            if (gen !== _this5._selfHealGen || !_this5.isValid) {
              return;
            }
            if (Date.now() - startedAt >= SELF_HEAL_MS) {
              return;
            }
            frames += 1;
            if (frames % SELF_HEAL_EVERY_FRAMES === 0) {
              var target = _this5._targetCanvasSize();
              if (!_this5._engineSizeMatchesTarget(target.w, target.h)) {
                _this5._selfHealCount += 1;
                console.log("[ViewBootstrap] self-heal #" + _this5._selfHealCount);
                _this5._enforce();
              }
            }
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        };
        _proto._computeLayout = function _computeLayout() {
          var render = getTuning().render;
          var dw = render.designWidth;
          var dh = render.designHeight;
          var aw = 320;
          var ah = 568;
          if (typeof window !== 'undefined') {
            aw = window.innerWidth;
            ah = window.innerHeight;
          }
          var scale = Math.min(aw / dw, ah / dh);
          scale = Math.max(2, Math.min(6, scale));
          var cssW = Math.round(dw * scale);
          var cssH = Math.round(dh * scale);
          return {
            dw: dw,
            dh: dh,
            scale: scale,
            cssW: cssW,
            cssH: cssH
          };
        };
        _proto._targetCanvasSize = function _targetCanvasSize() {
          var _this$_computeLayout = this._computeLayout(),
            cssW = _this$_computeLayout.cssW,
            cssH = _this$_computeLayout.cssH;
          return {
            w: cssW,
            h: cssH
          };
        };
        _proto._getGameCanvas = function _getGameCanvas() {
          if (typeof document === 'undefined') {
            return null;
          }
          var el = document.getElementById('GameCanvas');
          return el instanceof HTMLCanvasElement ? el : null;
        };
        _proto._callView = function _callView(name) {
          var fn = view[name];
          if (typeof fn === 'function') {
            for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
              args[_key2 - 1] = arguments[_key2];
            }
            fn.apply(view, args);
          }
        };
        _proto._engineDpr = function _engineDpr() {
          var fn = view.getDevicePixelRatio;
          if (typeof fn === 'function') {
            var dpr = fn.call(view);
            if (typeof dpr === 'number' && dpr > 0) {
              return dpr;
            }
          }
          return 1;
        };
        _proto._engineCanvasSize = function _engineCanvasSize() {
          var fn = view.getCanvasSize;
          if (typeof fn !== 'function') {
            return null;
          }
          var size = fn.call(view);
          if (!size || typeof size.width !== 'number' || typeof size.height !== 'number') {
            return null;
          }
          return {
            w: size.width,
            h: size.height
          };
        };
        _proto._near = function _near(a, b) {
          return Math.abs(a - b) < 1;
        }

        /**
         * Cocos 3.8 getCanvasSize() === screen.windowSize，返回的是 CSS×引擎DPR（物理像素），
         * 不是 CSS 像素。两种读数都认，避免和目标 cssW/cssH 永远对不上。
         */;
        _proto._engineSizeMatchesTarget = function _engineSizeMatchesTarget(cssW, cssH) {
          var engine = this._engineCanvasSize();
          if (!engine) {
            return false;
          }
          if (this._near(engine.w, cssW) && this._near(engine.h, cssH)) {
            return true;
          }
          var dpr = this._engineDpr();
          return this._near(engine.w, cssW * dpr) && this._near(engine.h, cssH * dpr);
        };
        _proto._focusGameCanvas = function _focusGameCanvas() {
          var _document$getElementB2;
          if (typeof document === 'undefined') {
            return;
          }
          (_document$getElementB2 = document.getElementById('GameCanvas')) == null || _document$getElementB2.focus();
          if (!this._focusHooked) {
            document.addEventListener('pointerdown', this._onPointerDownFocus);
            this._focusHooked = true;
          }
        };
        _proto._enforce = function _enforce() {
          var _this$_computeLayout2 = this._computeLayout(),
            dw = _this$_computeLayout2.dw,
            dh = _this$_computeLayout2.dh,
            scale = _this$_computeLayout2.scale,
            cssW = _this$_computeLayout2.cssW,
            cssH = _this$_computeLayout2.cssH;
          this._callView('resizeWithBrowserSize', false);
          var c = this._getGameCanvas();
          if (c) {
            c.style.width = cssW + "px";
            c.style.height = cssH + "px";
          }

          // 不调用 setDevicePixelRatio：3.8.5 没有这个 API（原先传 1 是空操作）。
          // backing 交给 setCanvasSize，由引擎按自身 DPR（常见为 min(window.dpr, 2)）去乘。
          this._callView('setCanvasSize', cssW, cssH);
          this._callView('setDesignResolutionSize', dw, dh, ResolutionPolicy.SHOW_ALL);
          this._focusGameCanvas();
          if (this._lastLoggedScale !== scale || this._lastLoggedCanvasW !== cssW || this._lastLoggedCanvasH !== cssH) {
            console.log("[ViewBootstrap] enforced " + cssW + "x" + cssH + " scale " + scale.toFixed(3) + " design " + dw + "x" + dh);
            this._lastLoggedScale = scale;
            this._lastLoggedCanvasW = cssW;
            this._lastLoggedCanvasH = cssH;
          }
        };
        return ViewBootstrap;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/WorldScroll.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Component, FixedStepDriver, initTuning, getTuning, LEVEL_ROWS;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      LEVEL_ROWS = module.LEVEL_ROWS;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "c4f8aLhaz1Kn458HQtabz6S", "WorldScroll", undefined);
      var ccclass = _decorator.ccclass;
      var WorldScroll = exports('WorldScroll', (_dec = ccclass('WorldScroll'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WorldScroll, _Component);
        function WorldScroll() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._player = null;
          _this._world = null;
          _this._camNode = null;
          _this._stepBound = false;
          return _this;
        }
        var _proto = WorldScroll.prototype;
        _proto.onLoad = function onLoad() {
          void initTuning();
        };
        _proto.start = function start() {
          this._resolveRefs();
          this._bindStep();
          this._scroll();
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[WorldScroll] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this2.enabled && _this2.node.activeInHierarchy) {
              _this2._scroll();
            }
          });
          this._stepBound = true;
        };
        _proto._resolveRefs = function _resolveRefs() {
          if (!this._world) {
            this._world = find('World');
            if (!this._world) {
              console.error('[WorldScroll] World node not found');
            }
          }
          if (!this._player) {
            this._player = find('World/Player');
            if (!this._player) {
              console.error('[WorldScroll] Player node not found at World/Player');
            }
          }
          if (!this._camNode) {
            this._camNode = find('Canvas/Camera');
            if (!this._camNode) {
              console.error('[WorldScroll] Camera node not found at Canvas/Camera');
            }
          }
        };
        _proto._scroll = function _scroll() {
          this._resolveRefs();
          if (!this._world || !this._player) {
            return;
          }
          var tuning = getTuning();
          var halfH = tuning.render.designHeight / 2;
          var wellBottom = -LEVEL_ROWS * tuning.level.tileSize;
          var minCamY = wellBottom + halfH;
          var maxCamY = -halfH;
          var camY = this._player.position.y;
          camY = Math.min(maxCamY, Math.max(minCamY, camY));
          var camWorldY = this._camNode ? this._camNode.worldPosition.y : 0;
          this._world.setPosition(0, camWorldY - camY, 0);
        };
        return WorldScroll;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});