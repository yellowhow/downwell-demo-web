System.register("chunks:///_virtual/AudioManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, AudioSource, assetManager, AudioClip, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      AudioSource = module.AudioSource;
      assetManager = module.assetManager;
      AudioClip = module.AudioClip;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "985e3VCz8ZBAo7b2XjUdgNk", "AudioManager", undefined);
      var ccclass = _decorator.ccclass;
      var SFX_NAMES = ['gun', 'jump', 'gem_get', 'gem_warn', 'stomp', 'player_hit', 'death'];
      function isSfxName(name) {
        return SFX_NAMES.includes(name);
      }
      var AudioManager = exports('AudioManager', (_dec = ccclass('AudioManager'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(AudioManager, _Component);
        function AudioManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._source = null;
          _this._clips = new Map();
          _this._muted = false;
          _this._lastPlayAt = new Map();
          return _this;
        }
        var _proto = AudioManager.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          var source = this.getComponent(AudioSource);
          if (!source) {
            source = this.addComponent(AudioSource);
          }
          source.playOnAwake = false;
          source.volume = 1;
          this._source = source;
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[AudioManager] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.loadDir('audio', AudioClip, function (loadErr, clips) {
              if (loadErr || !clips) {
                console.error('[AudioManager] loadDir failed path=audio', loadErr);
                return;
              }
              for (var _iterator = _createForOfIteratorHelperLoose(clips), _step; !(_step = _iterator()).done;) {
                var clip = _step.value;
                var key = clip.name;
                if (isSfxName(key)) {
                  _this2._clips.set(key, clip);
                }
              }
            });
          });
          if (typeof window !== 'undefined') {
            window.__dwAudio = this;
          }
        };
        _proto.play = function play(name) {
          var _this$_lastPlayAt$get;
          if (!this._source) {
            return;
          }
          var clip = this._clips.get(name);
          if (!clip) {
            return;
          }
          var now = performance.now();
          var last = (_this$_lastPlayAt$get = this._lastPlayAt.get(name)) != null ? _this$_lastPlayAt$get : 0;
          if (now - last < 16) {
            return;
          }
          this._lastPlayAt.set(name, now);
          this._source.playOneShot(clip, 1);
        };
        _proto.setMuted = function setMuted(m) {
          this._muted = m;
          if (this._source) {
            this._source.volume = m ? 0 : 1;
          }
        };
        _createClass(AudioManager, [{
          key: "muted",
          get: function get() {
            return this._muted;
          }
        }]);
        return AudioManager;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Bullet.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, UITransform, Graphics, Color, Component, getTuning, ROOM_ROWS, damageGemChunkAtWorld, solidAtWorld, crumbleHpAtWorld, damageAtWorld, ROOM_INSTANCES;
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
      ROOM_ROWS = module.ROOM_ROWS;
      damageGemChunkAtWorld = module.damageGemChunkAtWorld;
      solidAtWorld = module.solidAtWorld;
      crumbleHpAtWorld = module.crumbleHpAtWorld;
      damageAtWorld = module.damageAtWorld;
      ROOM_INSTANCES = module.ROOM_INSTANCES;
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
          var lastRoom = ROOM_INSTANCES[ROOM_INSTANCES.length - 1];
          var worldMinY = lastRoom.originY - ROOM_ROWS * tileSize;
          if (y > 0 || y < worldMinY) {
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
          var col0 = Math.floor(left / tileSize);
          var col1 = Math.floor((right - EPS) / tileSize);
          var row0 = Math.floor(-top / tileSize);
          var row1 = Math.floor((-bottom - EPS) / tileSize);
          for (var row = row0; row <= row1; row++) {
            for (var col = col0; col <= col1; col++) {
              var cx = col * tileSize + tileSize / 2;
              var cy = -row * tileSize - tileSize / 2;
              if (damageGemChunkAtWorld(cx, cy) !== 'none') {
                return true;
              }
              if (!solidAtWorld(cx, cy)) {
                continue;
              }
              if (crumbleHpAtWorld(cx, cy) > 0) {
                damageAtWorld(cx, cy);
              }
              return true;
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

System.register("chunks:///_virtual/ComboHud.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './ComboTracker.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Color, Label, find, Component, getTuning, ComboTracker;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Color = module.Color;
      Label = module.Label;
      find = module.find;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      ComboTracker = module.ComboTracker;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "eef41tXb2FK0JeNF9JtqIWp", "ComboHud", undefined);
      var ccclass = _decorator.ccclass;
      var BREAK_COLOR = new Color(255, 64, 64, 255);
      var NORMAL_COLOR = new Color(255, 255, 255, 255);
      var ComboHud = exports('ComboHud', (_dec = ccclass('ComboHud'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ComboHud, _Component);
        function ComboHud() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._label = null;
          _this._labelNode = null;
          _this._bodyNode = null;
          _this._lastCount = -1;
          _this._breakPending = false;
          return _this;
        }
        var _proto = ComboHud.prototype;
        _proto.onLoad = function onLoad() {
          var _this$_bodyNode, _child$getComponent;
          this._bodyNode = this.node.getChildByName('Body');
          var labelRoot = (_this$_bodyNode = this._bodyNode) != null ? _this$_bodyNode : this.node;
          var child = labelRoot.getChildByName('Label');
          this._labelNode = child;
          this._label = (_child$getComponent = child == null ? void 0 : child.getComponent(Label)) != null ? _child$getComponent : null;
          if (typeof window !== 'undefined') {
            window.__dwComboHud = this;
          }
        };
        _proto.update = function update() {
          var _find,
            _this2 = this;
          var combo = (_find = find('Game')) == null ? void 0 : _find.getComponent(ComboTracker);
          if (!combo) {
            if (this._bodyNode) {
              this._bodyNode.active = false;
            }
            return;
          }
          var minForTip = getTuning().combo.minForTip;
          var count = combo.count;
          var show = count >= minForTip;
          if (this._bodyNode) {
            this._bodyNode.active = show;
          }
          if (show && count !== this._lastCount && this._label) {
            this._lastCount = count;
            this._label.string = "x" + count;
          }
          if (!show) {
            this._lastCount = -1;
          }
          if (combo.justBroke && !this._breakPending) {
            this._breakPending = true;
            combo.clearJustBroke();
            if (this._label) {
              this._label.color = BREAK_COLOR;
            }
            if (this._labelNode) {
              this._labelNode.setScale(1.3, 1.3, 1);
            }
            this.scheduleOnce(function () {
              if (_this2._label) {
                _this2._label.color = NORMAL_COLOR;
              }
              if (_this2._labelNode) {
                _this2._labelNode.setScale(1, 1, 1);
              }
              _this2._breakPending = false;
            }, 0.25);
          }
        };
        return ComboHud;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ComboTracker.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts', './GemManager.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, Component, FixedStepDriver, getTuning, GemManager, PlayerController;
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
      getTuning = module.getTuning;
    }, function (module) {
      GemManager = module.GemManager;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "7554aKfkgVN6ZgrXfuaB1BU", "ComboTracker", undefined);
      var ccclass = _decorator.ccclass;
      var ComboTracker = exports('ComboTracker', (_dec = ccclass('ComboTracker'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ComboTracker, _Component);
        function ComboTracker() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._count = 0;
          _this._timer = 0;
          _this._justBroke = false;
          _this._brokeAt = 0;
          _this._stepBound = false;
          _this._gemManager = null;
          _this._gemManagerWarned = false;
          _this._playerWarned = false;
          _this._rewardKindLogged = false;
          return _this;
        }
        var _proto = ComboTracker.prototype;
        _proto.clearJustBroke = function clearJustBroke() {
          this._justBroke = false;
        };
        _proto.onLoad = function onLoad() {
          this._gemManager = this.node.getComponent(GemManager);
          if (!this._gemManager) {
            var _find$getComponent, _find;
            this._gemManager = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(GemManager)) != null ? _find$getComponent : null;
          }
          if (!this._gemManager && !this._gemManagerWarned) {
            console.error('[ComboTracker] GemManager not found');
            this._gemManagerWarned = true;
          }
          this._bindStep();
          if (typeof window !== 'undefined') {
            window.__dwCombo = this;
          }
        };
        _proto.hit = function hit() {
          var combo = getTuning().combo;
          this._count += 1;
          this._timer = combo.windowSteps;
          var rewardEvery = combo.rewardEvery;
          if (rewardEvery > 0 && this._count % rewardEvery === 0) {
            var rewardKind = String(combo.rewardKind).trim();
            if (!this._rewardKindLogged && typeof console !== 'undefined') {
              console.log('[ComboTracker] rewardKind=', JSON.stringify(rewardKind));
              this._rewardKindLogged = true;
            }
            this._spawnReward(rewardKind);
          }
        };
        _proto.onPlayerHurt = function onPlayerHurt() {
          var minForTip = getTuning().combo.minForTip;
          if (this._count >= minForTip) {
            this._brokeAt = this._count;
            this._justBroke = true;
          }
          this._count = 0;
          this._timer = 0;
        };
        _proto.step = function step() {
          if (this._timer <= 0) {
            return;
          }
          this._timer -= 1;
          if (this._timer === 0) {
            var minForTip = getTuning().combo.minForTip;
            if (this._count >= minForTip) {
              this._count = 0;
            }
          }
        };
        _proto._spawnReward = function _spawnReward(kind) {
          var _find3;
          if (!this._gemManager) {
            this._gemManager = this.node.getComponent(GemManager);
          }
          if (!this._gemManager) {
            var _find$getComponent2, _find2;
            this._gemManager = (_find$getComponent2 = (_find2 = find('Game')) == null ? void 0 : _find2.getComponent(GemManager)) != null ? _find$getComponent2 : null;
          }
          if (!this._gemManager) {
            if (!this._gemManagerWarned) {
              console.error('[ComboTracker] GemManager not found');
              this._gemManagerWarned = true;
            }
            return;
          }
          var player = (_find3 = find('World/Player')) == null ? void 0 : _find3.getComponent(PlayerController);
          if (!player) {
            if (!this._playerWarned) {
              console.error('[ComboTracker] PlayerController not found on World/Player');
              this._playerWarned = true;
            }
            return;
          }
          var pos = player.position;
          var normalized = kind.trim();
          var gemKind = normalized === 'medium' ? 'medium' : 'small';
          this._gemManager.spawnAt(gemKind, pos.x, pos.y);
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var driver = this.node.getComponent(FixedStepDriver);
          if (!driver) {
            console.error('[ComboTracker] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this2.enabled && _this2.node.activeInHierarchy) {
              _this2.step();
            }
          });
          this._stepBound = true;
        };
        _createClass(ComboTracker, [{
          key: "count",
          get: function get() {
            return this._count;
          }
        }, {
          key: "justBroke",
          get: function get() {
            return this._justBroke;
          }
        }, {
          key: "brokeAt",
          get: function get() {
            return this._brokeAt;
          }
        }]);
        return ComboTracker;
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

System.register("chunks:///_virtual/DebugOverlayLoader.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './DebugOverlay.ts', './HitboxDebug.ts', './FixedStepDriver.ts', './TuningConfig.ts', './BulletPool.ts', './Gunboots.ts', './ChargeBar.ts', './HeartHud.ts', './GameOver.ts', './ScoreHud.ts', './LevelHud.ts', './ComboHud.ts', './HudFrame.ts', './PlayerHealth.ts', './AudioManager.ts', './LevelFlow.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, assetManager, Prefab, instantiate, UITransform, Node, view, settings, Component, DebugOverlay, HitboxDebug, FixedStepDriver, getTuning, getTuningSource, BulletPool, Gunboots, ChargeBar, HeartHud, GameOver, ScoreHud, LevelHud, ComboHud, HudFrame, PlayerHealth, AudioManager, LevelFlow;
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
      Node = module.Node;
      view = module.view;
      settings = module.settings;
      Component = module.Component;
    }, function (module) {
      DebugOverlay = module.DebugOverlay;
    }, function (module) {
      HitboxDebug = module.HitboxDebug;
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
      ScoreHud = module.ScoreHud;
    }, function (module) {
      LevelHud = module.LevelHud;
    }, function (module) {
      ComboHud = module.ComboHud;
    }, function (module) {
      HudFrame = module.HudFrame;
    }, function (module) {
      PlayerHealth = module.PlayerHealth;
    }, function (module) {
      AudioManager = module.AudioManager;
    }, function (module) {
      LevelFlow = module.LevelFlow;
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
          this._ensureHitboxDebug();
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
              _this._loadHudFrame(canvas);
              _this._loadChargeBar(canvas);
              _this._loadHeartHud(canvas);
              _this._loadScoreHud(canvas);
              _this._loadLevelHud(canvas);
              _this._loadComboHud(canvas);
              _this._loadGameOver(canvas);
            });
          });
        };
        _proto._ensureGameplayComponents = function _ensureGameplayComponents() {
          var game = find('Game');
          if (game && !game.getComponent(BulletPool)) {
            game.addComponent(BulletPool);
          }
          if (game && !game.getComponent(AudioManager)) {
            game.addComponent(AudioManager);
          }
          var player = find('World/Player');
          if (player && !player.getComponent(Gunboots)) {
            player.addComponent(Gunboots);
          }
          if (player && !player.getComponent(PlayerHealth)) {
            player.addComponent(PlayerHealth);
          }
        };
        _proto._ensureHitboxDebug = function _ensureHitboxDebug() {
          var world = find('World');
          if (!world) {
            console.error('[DebugOverlayLoader] World not found for HitboxDebug');
            return;
          }
          var node = world.getChildByName('HitboxDebug');
          if (!node) {
            node = new Node('HitboxDebug');
            world.addChild(node);
          }
          node.setSiblingIndex(world.children.length - 1);
          if (!node.getComponent(HitboxDebug)) {
            node.addComponent(HitboxDebug);
          }
          if (world && !world.getComponent(LevelFlow)) {
            world.addComponent(LevelFlow);
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
        _proto._loadScoreHud = function _loadScoreHud(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for ScoreHud', bundleErr);
              return;
            }
            bundle.load('prefab/ScoreHud', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] score hud prefab load failed: prefab/ScoreHud');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(-46, 66);
              if (!node.getComponent(ScoreHud)) {
                node.addComponent(ScoreHud);
              }
            });
          });
        };
        _proto._loadLevelHud = function _loadLevelHud(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for LevelHud', bundleErr);
              return;
            }
            bundle.load('prefab/LevelHud', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] level hud prefab load failed: prefab/LevelHud');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              // GEMS 在 (-46,100)，LEVEL 放它右侧同一行
              node.setPosition(46, 100);
              if (!node.getComponent(LevelHud)) {
                node.addComponent(LevelHud);
              }
            });
          });
        };
        _proto._loadComboHud = function _loadComboHud(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for ComboHud', bundleErr);
              return;
            }
            bundle.load('prefab/ComboHud', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] combo hud prefab load failed: prefab/ComboHud');
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              // 原 (-52,86) 压在 DebugOverlay 首行文字上；挪到右侧，与 LEVEL 上下对称
              node.setPosition(52, 86);
              if (!node.getComponent(ComboHud)) {
                node.addComponent(ComboHud);
              }
            });
          });
        };
        _proto._loadHudFrame = function _loadHudFrame(canvas) {
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[DebugOverlayLoader] loadBundle failed bundle=mainui for HudFrame', bundleErr);
              return;
            }
            bundle.load('prefab/HudFrame', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[DebugOverlayLoader] hud frame prefab load failed: prefab/HudFrame', loadErr);
                return;
              }
              var node = instantiate(prefab);
              canvas.addChild(node);
              node.setPosition(0, 0);
              node.setSiblingIndex(1);
              if (!node.getComponent(HudFrame)) {
                node.addComponent(HudFrame);
              }
              console.log('[DebugOverlayLoader] HudFrame instantiated, children=' + node.children.length);
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

System.register("chunks:///_virtual/Enemy.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, UITransform, Sprite, Color, assetManager, SpriteFrame, Component, getTuning;
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
    }, function (module) {
      getTuning = module.getTuning;
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
        _proto.getHitbox = function getHitbox() {
          var eh = getTuning().enemyHitbox;
          var isSnail = this.kind === 'snail';
          var w = isSnail ? eh.snailWidth : eh.batWidth;
          var h = isSnail ? eh.snailHeight : eh.batHeight;
          var off = isSnail ? eh.snailOffsetY : eh.batOffsetY;
          var p = this.node.position;
          return {
            x: p.x,
            y: p.y + off,
            w: w,
            h: h
          };
        };
        _proto._stepSnail = function _stepSnail(tileSize, isSolidAt) {
          var x = this.node.position.x;
          var y = this.node.position.y;
          var hb = this.getHitbox();
          var halfW = hb.w / 2;
          var bottom = hb.y - hb.h / 2;
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

System.register("chunks:///_virtual/EnemyManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './FixedStepDriver.ts', './TuningConfig.ts', './BulletPool.ts', './ComboTracker.ts', './Enemy.ts', './GemManager.ts', './LevelData.ts', './PlayerController.ts', './PlayerHealth.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, find, assetManager, Prefab, instantiate, UITransform, Component, AudioManager, FixedStepDriver, getTuning, BulletPool, ComboTracker, Enemy, GemManager, PLATFORM_SPECS, platformTopY, LEVEL_COLS, solidAtWorld, FLOOR_START_ROW, PlayerController, PlayerHealth;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
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
      AudioManager = module.AudioManager;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      BulletPool = module.BulletPool;
    }, function (module) {
      ComboTracker = module.ComboTracker;
    }, function (module) {
      Enemy = module.Enemy;
    }, function (module) {
      GemManager = module.GemManager;
    }, function (module) {
      PLATFORM_SPECS = module.PLATFORM_SPECS;
      platformTopY = module.platformTopY;
      LEVEL_COLS = module.LEVEL_COLS;
      solidAtWorld = module.solidAtWorld;
      FLOOR_START_ROW = module.FLOOR_START_ROW;
    }, function (module) {
      PlayerController = module.PlayerController;
    }, function (module) {
      PlayerHealth = module.PlayerHealth;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "6754e7sG7FDmIw66eUW2Y3a", "EnemyManager", undefined);
      var ccclass = _decorator.ccclass;

      /** 蝙蝠：每 10 行一只，左右交替，铺满整口井 */
      function buildBatSlots() {
        var out = [];
        var i = 0;
        for (var row = 8; row <= FLOOR_START_ROW - 6; row += 10) {
          out.push({
            x: i % 2 === 0 ? 60 : 100,
            y: -row * 16 - 8
          });
          i += 1;
        }
        return out;
      }

      /** 蜗牛：每 4 个平台取一个 left/right 平台（跳掉 middle） */
      function buildSnailIndices() {
        var out = [];
        for (var idx = 3; idx < PLATFORM_SPECS.length; idx += 4) {
          out.push(idx);
        }
        return out;
      }
      var BAT_SLOTS = buildBatSlots();
      var SNAIL_INDICES = buildSnailIndices();
      var ENEMY_POOL_SIZE = BAT_SLOTS.length + SNAIL_INDICES.length;

      /** 在 PLATFORM_SPECS 中下标 index 处取平台；若为 middle 则向后顺延至 left/right。 */
      function snailPlatformAtIndex(index) {
        for (var i = index; i < PLATFORM_SPECS.length; i += 1) {
          var spec = PLATFORM_SPECS[i];
          if (spec.side !== 'middle') {
            return {
              spec: spec,
              usedIndex: i
            };
          }
        }
        throw new Error("[EnemyManager] no left/right platform at or after index " + index);
      }
      function snailSpawnFromSpec(spec) {
        var tileSize = getTuning().level.tileSize;
        var x = spec.col0 * tileSize + spec.len * tileSize / 2;
        var y = platformTopY(spec) + tileSize;
        return {
          x: x,
          y: y
        };
      }
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
          _this._gemManager = null;
          _this._gemManagerWarned = false;
          _this._audio = null;
          _this._combo = null;
          _this._comboWarned = false;
          _this._playerCtrl = null;
          return _this;
        }
        var _proto = EnemyManager.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this,
            _find$getComponent,
            _find,
            _find$getComponent2,
            _find2;
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
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
          this._gemManager = this.node.getComponent(GemManager);
          if (!this._gemManager) {
            console.error('[EnemyManager] GemManager not found on Game');
            this._gemManagerWarned = true;
          }
          this._combo = this.node.getComponent(ComboTracker);
          if (!this._combo && !this._comboWarned) {
            console.error('[EnemyManager] ComboTracker not found on Game');
            this._comboWarned = true;
          }
          this._playerCtrl = (_find$getComponent2 = (_find2 = find('World/Player')) == null ? void 0 : _find2.getComponent(PlayerController)) != null ? _find$getComponent2 : null;
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
        }

        // 约束：蜗牛必须站在 left/right 平台中心；蝙蝠悬在平台行之间的空档（y = -row*16-8），
        // 横向 x 左右交替，避免开局落体路径上必然碰撞。
        ;

        _proto._spawnInitial = function _spawnInitial() {
          if (!this._poolReady) {
            return;
          }
          for (var _iterator = _createForOfIteratorHelperLoose(BAT_SLOTS), _step2; !(_step2 = _iterator()).done;) {
            var slot = _step2.value;
            this._spawnOne('bat', slot.x, slot.y, 1);
          }
          for (var _iterator2 = _createForOfIteratorHelperLoose(SNAIL_INDICES), _step3; !(_step3 = _iterator2()).done;) {
            var idx = _step3.value;
            var _snailPlatformAtIndex = snailPlatformAtIndex(idx),
              spec = _snailPlatformAtIndex.spec,
              usedIndex = _snailPlatformAtIndex.usedIndex;
            if (usedIndex !== idx) {
              console.warn("[EnemyManager] snail slot index " + idx + " is middle (row " + PLATFORM_SPECS[idx].row + "); using index " + usedIndex + " row " + spec.row + " side " + spec.side);
            }
            var _snailSpawnFromSpec = snailSpawnFromSpec(spec),
              x = _snailSpawnFromSpec.x,
              y = _snailSpawnFromSpec.y;
            this._spawnOne('snail', x, y, 2);
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
            if (col < 0 || col >= LEVEL_COLS) {
              return true;
            }
            var cx = col * tileSize + tileSize / 2;
            var cy = -row * tileSize - tileSize / 2;
            return solidAtWorld(cx, cy);
          };
          for (var i = this._active.length - 1; i >= 0; i -= 1) {
            var enemy = this._active[i];
            if (enemy.step(tileSize, isSolidAt)) {
              this._recycle(enemy);
            }
          }
          if (!this._bulletPool) {
            var _find$getComponent3, _find3;
            this._bulletPool = (_find$getComponent3 = (_find3 = find('Game')) == null ? void 0 : _find3.getComponent(BulletPool)) != null ? _find$getComponent3 : null;
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
              var eh = _enemy.getHitbox();
              var ex = eh.x;
              var ey = eh.y;
              var ehw = eh.w / 2;
              var ehh = eh.h / 2;
              if (Math.abs(ex - bx) < ehw + bhw && Math.abs(ey - by) < ehh + bhh) {
                pool.recycle(bullet);
                if (_enemy.damage(1)) {
                  var _this$_combo;
                  (_this$_combo = this._combo) == null || _this$_combo.hit();
                  this._dropGemAndRecycle(_enemy);
                }
                break;
              }
            }
          }
          if (!this._playerHealth) {
            var _find$getComponent4, _find4;
            this._playerHealth = (_find$getComponent4 = (_find4 = find('World/Player')) == null ? void 0 : _find4.getComponent(PlayerHealth)) != null ? _find$getComponent4 : null;
          }
          var playerHealth = this._playerHealth;
          if (!playerHealth || playerHealth.isDead) {
            return;
          }
          var playerCtrl = this._playerCtrl;
          if (!playerCtrl) {
            return;
          }
          var ph = playerCtrl.getHitbox();
          var pVy = playerCtrl.velocity.y;
          var stomp = getTuning().stomp;
          var playerFootY = ph.y - ph.h / 2;
          if (pVy < 0) {
            for (var _ei = 0; _ei < this._active.length; _ei += 1) {
              var _enemy2 = this._active[_ei];
              if (!_enemy2.alive) {
                continue;
              }
              var _eh = _enemy2.getHitbox();
              var overlap = Math.abs(_eh.x - ph.x) < (_eh.w + ph.w) / 2 && Math.abs(_eh.y - ph.y) < (_eh.h + ph.h) / 2;
              if (overlap && playerFootY - _eh.y > stomp.toleranceY) {
                var _this$_audio;
                if (_enemy2.damage(999)) {
                  var _this$_combo2;
                  (_this$_combo2 = this._combo) == null || _this$_combo2.hit();
                  this._dropGemAndRecycle(_enemy2);
                }
                (_this$_audio = this._audio) == null || _this$_audio.play('stomp');
                playerCtrl.bounceFromStomp();
                break;
              }
            }
          }
          for (var _ei2 = 0; _ei2 < this._active.length; _ei2 += 1) {
            var _enemy3 = this._active[_ei2];
            if (!_enemy3.alive) {
              continue;
            }
            var _eh2 = _enemy3.getHitbox();
            var _overlap = Math.abs(_eh2.x - ph.x) < (_eh2.w + ph.w) / 2 && Math.abs(_eh2.y - ph.y) < (_eh2.h + ph.h) / 2;
            if (_overlap) {
              if (playerHealth.takeDamage(1, _eh2.x)) {
                break;
              }
            }
          }
        };
        _proto._dropGemAndRecycle = function _dropGemAndRecycle(enemy) {
          if (!this._gemManager && !this._gemManagerWarned) {
            this._gemManager = this.node.getComponent(GemManager);
            if (!this._gemManager) {
              console.error('[EnemyManager] GemManager not found on Game');
              this._gemManagerWarned = true;
            }
          }
          if (this._gemManager) {
            var kind = enemy.kind === 'snail' ? 'medium' : 'small';
            this._gemManager.spawnAt(kind, enemy.node.position.x, enemy.node.position.y);
          }
          this._recycle(enemy);
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

System.register("chunks:///_virtual/GameOver.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './RunState.ts', './TuningConfig.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Graphics, UITransform, Color, director, Component, FixedStepDriver, runState, getTuning;
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
      runState = module.runState;
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
            // 死亡重开 = 新的一局，必须清空跨关卡状态（否则继承上一局的关卡号和分数）
            runState.reset();
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

System.register("chunks:///_virtual/Gem.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './TuningConfig.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, UITransform, Sprite, Color, assetManager, SpriteFrame, Component, AudioManager, getTuning;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      Color = module.Color;
      assetManager = module.assetManager;
      SpriteFrame = module.SpriteFrame;
      Component = module.Component;
    }, function (module) {
      AudioManager = module.AudioManager;
    }, function (module) {
      getTuning = module.getTuning;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "078f85qJYxL4LmYfklugG85", "Gem", undefined);
      var ccclass = _decorator.ccclass;
      var Gem = exports('Gem', (_dec = ccclass('Gem'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Gem, _Component);
        function Gem() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._kind = 'small';
          _this._vx = 0;
          _this._vy = 0;
          _this._life = 0;
          _this._bounces = 0;
          _this._animStep = 0;
          _this._sprite = null;
          _this._frames = [null, null, null, null];
          _this._framesLoaded = false;
          _this._framesLoading = false;
          _this._inBlinkZone = false;
          _this._lastBlinkPhase = -1;
          _this._warnPlayed = false;
          _this._audio = null;
          return _this;
        }
        var _proto = Gem.prototype;
        _proto.onLoad = function onLoad() {
          var _find$getComponent, _find;
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
        };
        _proto.init = function init(kind, x, y) {
          var tuning = getTuning().gems;
          this._kind = kind;
          this._vx = (Math.random() - 0.5) * 0.8;
          this._vy = tuning.popUpSpeed;
          this._life = tuning.lifeSteps;
          this._bounces = 0;
          this._animStep = 0;
          this._inBlinkZone = false;
          this._lastBlinkPhase = -1;
          this._warnPlayed = false;
          this.node.setPosition(x, y);
          this.node.active = true;
          var ut = this.getComponent(UITransform);
          if (ut) {
            var size = kind === 'small' ? 16 : 24;
            ut.setContentSize(size, size);
          }
          if (!this._sprite) {
            this._sprite = this.getComponent(Sprite);
          }
          if (this._sprite) {
            this._sprite.color = new Color(255, 255, 255, 255);
            this._sprite.enabled = true;
          }
          this._ensureFramesLoaded();
        };
        _proto.step = function step(tileSize, isSolidAt) {
          this._life -= 1;
          if (this._life <= 0) {
            return true;
          }
          this._updateBlink();
          var tuning = getTuning().gems;
          this._vy -= tuning.gravity;
          var x = this.node.position.x;
          var y = this.node.position.y;
          var ut = this.getComponent(UITransform);
          var halfH = ut ? ut.height / 2 : 8;
          var halfW = ut ? ut.width / 2 : 8;
          var nextY = y + this._vy;
          var colY = Math.floor(x / tileSize);
          var rowY = Math.floor(-nextY / tileSize);
          if (this._vy < 0 && isSolidAt(colY, rowY)) {
            var tileTop = -rowY * tileSize;
            y = tileTop + halfH;
            this._vy = -this._vy * tuning.bounceFactor;
            this._bounces += 1;
            if (this._bounces > tuning.maxBounces || Math.abs(this._vy) < 0.4) {
              this._vy = 0;
            }
          } else {
            y = nextY;
          }
          var nextX = x + this._vx;
          var rowX = Math.floor(-y / tileSize);
          var probeCol = this._vx > 0 ? Math.floor((nextX + halfW) / tileSize) : Math.floor((nextX - halfW) / tileSize);
          if (this._vx !== 0 && isSolidAt(probeCol, rowX)) {
            this._vx = -this._vx * 0.5;
          } else {
            x = nextX;
          }
          this.node.setPosition(x, y);
          this._animStep += 1;
          if (this._animStep % 8 === 0 && this._framesLoaded && this._sprite) {
            var frameIndex = Math.floor(this._animStep / 8) % 4;
            var frame = this._frames[frameIndex];
            if (frame) {
              this._sprite.spriteFrame = frame;
            }
          }
          return false;
        };
        _proto._updateBlink = function _updateBlink() {
          var blinkSteps = getTuning().gems.blinkSteps;
          var inBlink = this._life <= blinkSteps;
          if (!this._warnPlayed && inBlink) {
            var _this$_audio;
            this._warnPlayed = true;
            (_this$_audio = this._audio) == null || _this$_audio.play('gem_warn');
          }
          if (!inBlink) {
            if (this._inBlinkZone && this._sprite) {
              this._sprite.enabled = true;
            }
            this._inBlinkZone = false;
            this._lastBlinkPhase = -1;
            return;
          }
          var phase = Math.floor(this._life / 6) % 2;
          if (!this._inBlinkZone || phase !== this._lastBlinkPhase) {
            if (this._sprite) {
              this._sprite.enabled = phase === 0;
            }
            this._lastBlinkPhase = phase;
          }
          this._inBlinkZone = true;
        };
        _proto._ensureFramesLoaded = function _ensureFramesLoaded() {
          var _this2 = this;
          if (this._framesLoaded || this._framesLoading) {
            return;
          }
          this._framesLoading = true;
          var prefix = this._kind === 'small' ? 'sprite/gem/gem_s_' : 'sprite/gem/gem_m_';
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[Gem] sprite load failed kind=' + _this2._kind);
              _this2._framesLoading = false;
              return;
            }
            var pending = 4;
            var _loop = function _loop(i) {
              var path = "" + prefix + String(i).padStart(2, '0') + "/spriteFrame";
              bundle.load(path, SpriteFrame, function (loadErr, frame) {
                if (loadErr || !frame) {
                  console.error('[Gem] sprite load failed kind=' + _this2._kind + ' path=' + path);
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
        _createClass(Gem, [{
          key: "score",
          get: function get() {
            var g = getTuning().gems;
            return this._kind === 'small' ? g.smallScore : g.mediumScore;
          }
        }]);
        return Gem;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/GemManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './RunState.ts', './FixedStepDriver.ts', './TuningConfig.ts', './LevelData.ts', './Gem.ts', './Gunboots.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, assetManager, Prefab, instantiate, UITransform, Component, AudioManager, runState, FixedStepDriver, getTuning, LEVEL_ROWS, LEVEL_COLS, LEVEL_GRID, Gem, Gunboots;
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
      AudioManager = module.AudioManager;
    }, function (module) {
      runState = module.runState;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      LEVEL_ROWS = module.LEVEL_ROWS;
      LEVEL_COLS = module.LEVEL_COLS;
      LEVEL_GRID = module.LEVEL_GRID;
    }, function (module) {
      Gem = module.Gem;
    }, function (module) {
      Gunboots = module.Gunboots;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "4be01m1ZlpKE7sUn+X0N7nO", "GemManager", undefined);
      var ccclass = _decorator.ccclass;
      var GEM_POOL_SIZE = 24;
      var GemManager = exports('GemManager', (_dec = ccclass('GemManager'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(GemManager, _Component);
        function GemManager() {
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
          _this._gunboots = null;
          _this._audio = null;
          return _this;
        }
        var _proto = GemManager.prototype;
        _proto.resetScore = function resetScore() {
          runState.score = 0;
        };
        _proto.onLoad = function onLoad() {
          var _this2 = this,
            _find$getComponent,
            _find;
          this._world = find('World');
          if (!this._world) {
            console.error('[GemManager] World node not found');
            return;
          }
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[GemManager] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.load('prefab/Gem', Prefab, function (loadErr, prefab) {
              if (loadErr || !prefab) {
                console.error('[GemManager] prefab/Gem load failed');
                return;
              }
              for (var i = 0; i < GEM_POOL_SIZE; i += 1) {
                var node = instantiate(prefab);
                _this2._world.addChild(node);
                var gem = node.getComponent(Gem);
                if (!gem) {
                  gem = node.addComponent(Gem);
                }
                node.active = false;
                _this2._free.push(gem);
              }
              _this2._poolReady = true;
            });
          });
          this._bindStep();
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
          if (typeof window !== 'undefined') {
            window.__dwGems = this;
            window.__dwGemList = this._active;
          }
        };
        _proto.spawnAt = function spawnAt(kind, x, y) {
          if (!this._poolReady) {
            return null;
          }
          var gem = this._free.pop();
          if (!gem && this._active.length > 0) {
            gem = this._active.shift();
            gem.node.active = false;
          }
          if (!gem) {
            console.warn('[GemManager] gem pool empty');
            return null;
          }
          gem.init(kind, x, y);
          this._active.push(gem);
          return gem;
        };
        _proto._bindStep = function _bindStep() {
          var _this3 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[GemManager] FixedStepDriver not found on Game');
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
          var tileSize = getTuning().level.tileSize;
          var isSolidAt = function isSolidAt(col, row) {
            if (row < 0 || row >= LEVEL_ROWS || col < 0 || col >= LEVEL_COLS) {
              return true;
            }
            return LEVEL_GRID[row][col] === 1;
          };
          for (var i = this._active.length - 1; i >= 0; i -= 1) {
            var gem = this._active[i];
            if (gem.step(tileSize, isSolidAt)) {
              this._recycle(gem);
            }
          }
          var playerNode = find('World/Player');
          if (!playerNode) {
            return;
          }
          var put = playerNode.getComponent(UITransform);
          if (!put) {
            return;
          }
          var phw = put.width / 2;
          var phh = put.height / 2;
          var px = playerNode.position.x;
          var py = playerNode.position.y;
          if (!this._gunboots) {
            var _playerNode$getCompon;
            this._gunboots = (_playerNode$getCompon = playerNode.getComponent(Gunboots)) != null ? _playerNode$getCompon : null;
          }
          var chargePerGem = getTuning().gems.chargePerGem;
          for (var _i = this._active.length - 1; _i >= 0; _i -= 1) {
            var _gem = this._active[_i];
            if (!_gem.node.active) {
              continue;
            }
            var gut = _gem.getComponent(UITransform);
            if (!gut) {
              continue;
            }
            var ghw = gut.width / 2;
            var ghh = gut.height / 2;
            var gx = _gem.node.position.x;
            var gy = _gem.node.position.y;
            if (Math.abs(gx - px) < ghw + phw && Math.abs(gy - py) < ghh + phh) {
              var _this$_audio, _this$_gunboots;
              runState.score += _gem.score;
              (_this$_audio = this._audio) == null || _this$_audio.play('gem_get');
              (_this$_gunboots = this._gunboots) == null || _this$_gunboots.addCharge(chargePerGem);
              this._recycle(_gem);
            }
          }
        };
        _proto._recycle = function _recycle(gem) {
          var idx = this._active.indexOf(gem);
          if (idx >= 0) {
            this._active.splice(idx, 1);
          }
          gem.node.active = false;
          this._free.push(gem);
        };
        _createClass(GemManager, [{
          key: "score",
          get: function get() {
            return runState.score;
          }
        }]);
        return GemManager;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Gunboots.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './FixedStepDriver.ts', './InputState.ts', './TuningConfig.ts', './BulletPool.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, Component, AudioManager, FixedStepDriver, inputState, getTuning, initTuning, BulletPool, PlayerController;
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
      AudioManager = module.AudioManager;
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
          _this._wasGrounded = true;
          _this._stepBound = false;
          _this._player = null;
          _this._pool = null;
          _this._audio = null;
          return _this;
        }
        var _proto = Gunboots.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this,
            _find$getComponent,
            _find;
          this._charge = getTuning().gunboots.chargeMax;
          void initTuning().then(function () {
            _this2._charge = getTuning().gunboots.chargeMax;
          });
          this._player = this.getComponent(PlayerController);
          if (!this._player) {
            console.error('[Gunboots] PlayerController missing on same node');
          } else {
            this._wasGrounded = this._player.onGround;
          }
          this._bindStep();
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
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
            var _find$getComponent2, _find2;
            this._pool = (_find$getComponent2 = (_find2 = find('Game')) == null ? void 0 : _find2.getComponent(BulletPool)) != null ? _find$getComponent2 : null;
          }
          var tuning = getTuning();
          var g = tuning.gunboots;
          var grounded = this._player ? this._player.onGround : false;
          if (grounded && !this._wasGrounded) {
            this._charge = g.chargeMax;
            this._rechargeStepAcc = 0;
            this._stepsSinceLastShot = g.rechargeDelaySteps;
          }
          this._wasGrounded = grounded;

          /** 只有离地才能开火（用户拍板） */
          var fireAllowed = inputState.fireHeld && !grounded;

          /** 真正在射击 = 有输入 + 离地 + 有充能；悬停钳制与 shoot 动画都依赖它 */
          var actuallyFiring = fireAllowed && this._charge >= g.chargeCostPerShot;
          if (this._player) {
            this._player.firingHeld = actuallyFiring;
          }
          if (actuallyFiring && this._cooldown <= 0 && this._charge >= g.chargeCostPerShot) {
            var _this$_audio, _this$_player;
            this._charge -= g.chargeCostPerShot;
            (_this$_audio = this._audio) == null || _this$_audio.play('gun');
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
        }

        /** 宝石入账：DW-09 的 scrRechargeGem → gainCharge 链路 */;
        _proto.addCharge = function addCharge(n) {
          var g = getTuning().gunboots;
          this._charge = Math.min(g.chargeMax, this._charge + n);
          this._stepsSinceLastShot = 0;
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

System.register("chunks:///_virtual/HitboxDebug.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './LevelData.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Graphics, find, Layers, Color, Component, getTuning, LEVEL_GRID, LEVEL_COLS, LEVEL_ROWS, PlayerController;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Graphics = module.Graphics;
      find = module.find;
      Layers = module.Layers;
      Color = module.Color;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      LEVEL_GRID = module.LEVEL_GRID;
      LEVEL_COLS = module.LEVEL_COLS;
      LEVEL_ROWS = module.LEVEL_ROWS;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "c7e918qi01Oap8BLY5aazxA", "HitboxDebug", undefined);
      var ccclass = _decorator.ccclass;
      var EPS = 1e-4;
      var TILE_CULL_PAD = 64;
      var HitboxDebug = exports('HitboxDebug', (_dec = ccclass('HitboxDebug'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(HitboxDebug, _Component);
        function HitboxDebug() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._graphics = null;
          _this._enabledDraw = true;
          _this._playerCtrl = null;
          return _this;
        }
        var _proto = HitboxDebug.prototype;
        _proto.onLoad = function onLoad() {
          var _this$getComponent, _find$getComponent, _find;
          if (typeof window !== 'undefined') {
            var w = window;
            if (w.__dwHitboxOn === undefined) {
              w.__dwHitboxOn = true;
            }
          }
          this._applyUiLayer(this.node);
          this._graphics = (_this$getComponent = this.getComponent(Graphics)) != null ? _this$getComponent : this.addComponent(Graphics);
          this._playerCtrl = (_find$getComponent = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(PlayerController)) != null ? _find$getComponent : null;
        };
        _proto._applyUiLayer = function _applyUiLayer(node) {
          node.layer = Layers.Enum.UI_2D;
          for (var i = 0; i < node.children.length; i += 1) {
            this._applyUiLayer(node.children[i]);
          }
        };
        _proto.setEnabled = function setEnabled(on) {
          this._enabledDraw = on;
          if (!on) {
            var _this$_graphics;
            (_this$_graphics = this._graphics) == null || _this$_graphics.clear();
          }
        };
        _proto.update = function update() {
          var g = this._graphics;
          if (!g) {
            return;
          }
          var winOn = typeof window === 'undefined' || window.__dwHitboxOn !== false;
          if (!this._enabledDraw || !winOn) {
            g.clear();
            return;
          }
          g.clear();
          g.lineWidth = 1;
          var playerCtrl = this._playerCtrl;
          if (!playerCtrl) {
            return;
          }
          var tuning = getTuning();
          var ph = playerCtrl.getHitbox();
          var pos = playerCtrl.position;
          var visual = {
            x: pos.x,
            y: pos.y,
            w: tuning.player.bodyWidth,
            h: tuning.player.bodyHeight
          };
          this._strokeRect(g, new Color(64, 128, 255, 255), visual);
          this._strokeRect(g, new Color(255, 64, 64, 255), ph);
          this._drawNearbyTiles(g, ph);
          var active = window.__dwEnemyList;
          if (active) {
            for (var i = 0; i < active.length; i += 1) {
              var enemy = active[i];
              if (!(enemy != null && enemy.alive)) {
                continue;
              }
              this._strokeRect(g, new Color(255, 208, 64, 255), enemy.getHitbox());
            }
          }
        };
        _proto._drawNearbyTiles = function _drawNearbyTiles(g, ph) {
          var tileSize = getTuning().level.tileSize;
          var pad = TILE_CULL_PAD;
          var left = ph.x - ph.w / 2 - pad;
          var right = ph.x + ph.w / 2 + pad;
          var bottom = ph.y - ph.h / 2 - pad;
          var top = ph.y + ph.h / 2 + pad;
          var col0 = Math.max(0, Math.floor(left / tileSize));
          var col1 = Math.min(LEVEL_COLS - 1, Math.floor((right - EPS) / tileSize));
          var row0 = Math.max(0, Math.floor(-top / tileSize));
          var row1 = Math.min(LEVEL_ROWS - 1, Math.floor((-bottom - EPS) / tileSize));
          g.strokeColor = new Color(64, 255, 128, 255);
          for (var row = row0; row <= row1; row += 1) {
            for (var col = col0; col <= col1; col += 1) {
              if (LEVEL_GRID[row][col] !== 1) {
                continue;
              }
              var tileLeft = col * tileSize;
              var tileBottom = -(row + 1) * tileSize;
              g.rect(tileLeft, tileBottom, tileSize, tileSize);
              g.stroke();
            }
          }
        };
        _proto._strokeRect = function _strokeRect(g, color, box) {
          g.strokeColor = color;
          var x = box.x - box.w / 2;
          var y = box.y - box.h / 2;
          g.rect(x, y, box.w, box.h);
          g.stroke();
        };
        return HitboxDebug;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/HudFrame.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, find, Component;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "a1b2cPU5fZHiaASNFZ4q8AB", "HudFrame", undefined);
      var ccclass = _decorator.ccclass;
      var RETRY_INTERVAL_SEC = 0.1;
      var MAX_RETRIES = 40;
      var PENDING_PATHS = {
        HeartHud: 'Canvas/HeartHud',
        ScoreHud: 'Canvas/ScoreHud',
        ChargeBar: 'Canvas/ChargeBar',
        DebugOverlay: 'Canvas/DebugOverlay'
      };
      var HudFrame = exports('HudFrame', (_dec = ccclass('HudFrame'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(HudFrame, _Component);
        function HudFrame() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._retryCount = 0;
          _this._retryTimer = null;
          _this._pending = new Set(['HeartHud', 'ScoreHud', 'ChargeBar', 'DebugOverlay']);
          return _this;
        }
        var _proto = HudFrame.prototype;
        _proto.onLoad = function onLoad() {
          window.__dwHudFrame = this;
          this._scheduleRetry();
        };
        _proto.onDestroy = function onDestroy() {
          this._clearRetryTimer();
        };
        _proto._clearRetryTimer = function _clearRetryTimer() {
          if (this._retryTimer !== null) {
            clearTimeout(this._retryTimer);
            this._retryTimer = null;
          }
        };
        _proto._scheduleRetry = function _scheduleRetry() {
          this._clearRetryTimer();
          this._tryApplyLayout();
        };
        _proto._moveAndLog = function _moveAndLog(name, node, x, y) {
          var before = node.getPosition();
          node.setPosition(x, y);
          console.log("[HudFrame] moved " + name + " y " + before.y + " -> " + y);
        };
        _proto._tryApplyLayout = function _tryApplyLayout() {
          var _this2 = this;
          if (this._pending.size === 0) {
            return;
          }
          if (this._pending.has('HeartHud')) {
            var node = find(PENDING_PATHS.HeartHud);
            if (node) {
              this._moveAndLog('HeartHud', node, 0, 118);
              this._pending["delete"]('HeartHud');
            }
          }
          if (this._pending.has('ScoreHud')) {
            var _node = find(PENDING_PATHS.ScoreHud);
            if (_node) {
              this._moveAndLog('ScoreHud', _node, -46, 100);
              this._pending["delete"]('ScoreHud');
            }
          }
          if (this._pending.has('ChargeBar')) {
            var _node2 = find(PENDING_PATHS.ChargeBar);
            if (_node2) {
              this._moveAndLog('ChargeBar', _node2, 0, -70);
              this._pending["delete"]('ChargeBar');
            }
          }
          if (this._pending.has('DebugOverlay')) {
            var _node3 = find(PENDING_PATHS.DebugOverlay);
            if (_node3) {
              var before = _node3.getPosition();
              _node3.setPosition(before.x, 90);
              console.log("[HudFrame] moved DebugOverlay y " + before.y + " -> 90");
              this._pending["delete"]('DebugOverlay');
            }
          }
          if (this._pending.size === 0) {
            this._clearRetryTimer();
            var debugOverlay = find(PENDING_PATHS.DebugOverlay);
            var canvas = find('Canvas');
            if (debugOverlay && canvas) {
              debugOverlay.setSiblingIndex(canvas.children.length - 1);
            }
            return;
          }
          this._retryCount += 1;
          if (this._retryCount >= MAX_RETRIES) {
            for (var _iterator = _createForOfIteratorHelperLoose(this._pending), _step; !(_step = _iterator()).done;) {
              var key = _step.value;
              console.error("[HudFrame] " + key + " not found after " + MAX_RETRIES + " retries");
            }
            this._clearRetryTimer();
            return;
          }
          this._retryTimer = setTimeout(function () {
            return _this2._tryApplyLayout();
          }, RETRY_INTERVAL_SEC * 1000);
        };
        return HudFrame;
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
            case KeyCode.KEY_Z:
            case KeyCode.KEY_J:
              this._setKeyChannel('jump', down);
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

System.register("chunks:///_virtual/LevelData.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        assertLevel: assertLevel,
        bottomPortalCenter: bottomPortalCenter,
        buildRoomGrid: buildRoomGrid,
        consumeCrumbleEvents: consumeCrumbleEvents,
        consumeGemChunkEvents: consumeGemChunkEvents,
        crumbleHpAtWorld: crumbleHpAtWorld,
        damageAtWorld: damageAtWorld,
        damageCell: damageCell,
        damageGemChunkAtWorld: damageGemChunkAtWorld,
        platformTopY: platformTopY,
        solidAtWorld: solidAtWorld
      });
      cclegacy._RF.push({}, "e7c3dkaK09OCJxtGlt+DyxI", "LevelData", undefined);
      /** 手摆竖井：16px 格（sprTile1），11 列；内宽 9 格（144px），墙厚 1 格。深度由 LEVEL_SCREENS 驱动。 */
      var LEVEL_COLS = exports('LEVEL_COLS', 11);

      /** 一小关几屏。★ 想调关卡长度只改这一个数字 ★ 1 屏 = 17 行 ≈ 272px */
      var LEVEL_SCREENS = exports('LEVEL_SCREENS', 8);

      /** 每屏行数（视口 284px / 16px，取整 17） */
      var ROWS_PER_SCREEN = exports('ROWS_PER_SCREEN', 17);

      /** 井底地面厚度（行） */
      var FLOOR_THICKNESS = exports('FLOOR_THICKNESS', 3);

      /** 井的总行数：屏幕数 × 每屏行数 + 地面厚度 */
      var LEVEL_ROWS = exports('LEVEL_ROWS', LEVEL_SCREENS * ROWS_PER_SCREEN + FLOOR_THICKNESS);

      /** 地面起始行（含） */
      var FLOOR_START_ROW = exports('FLOOR_START_ROW', LEVEL_ROWS - FLOOR_THICKNESS);
      var LEVEL_TILE_PX = exports('LEVEL_TILE_PX', 16);
      var WALL_THICKNESS = exports('WALL_THICKNESS', 1);
      var PLAYABLE_COL0 = exports('PLAYABLE_COL0', 1);
      var PLAYABLE_COL1 = exports('PLAYABLE_COL1', LEVEL_COLS - WALL_THICKNESS - 1); // 9

      /** 世界整体水平偏移：176px 宽的世界在 160px 视口里居中（只影响渲染，物理坐标不动） */
      var LEVEL_VIEW_OFFSET_X = exports('LEVEL_VIEW_OFFSET_X', -8);
      /**
       * 厚平台：从 row 6 起每 4 行一块，左 → 右 → 中 循环，直到地面之前。
       * 列宽与 col0 沿用原设计（left=1,len=3 / middle=4,len=3 / right=7,len=3）。
       */
      function buildPlatformSpecs() {
        var specs = [];
        var sides = ['left', 'right', 'middle'];
        var i = 0;
        for (var row = 6; row <= FLOOR_START_ROW - 4; row += 4) {
          var side = sides[i % sides.length];
          var col0 = side === 'left' ? 1 : side === 'middle' ? 4 : 7;
          specs.push({
            row: row,
            side: side,
            col0: col0,
            len: 3
          });
          i += 1;
        }
        return specs;
      }
      var PLATFORM_SPECS = exports('PLATFORM_SPECS', buildPlatformSpecs());

      /** 薄板：从 row 8 起每 12 行一块，左右交替，与厚平台错开 */
      function buildThinPlatformSpecs() {
        var specs = [];
        var i = 0;
        for (var row = 8; row <= FLOOR_START_ROW - 6; row += 12) {
          specs.push({
            row: row,
            col0: i % 2 === 0 ? 5 : 2,
            len: 3
          });
          i += 1;
        }
        return specs;
      }
      var THIN_PLATFORM_SPECS = exports('THIN_PLATFORM_SPECS', buildThinPlatformSpecs());

      /** 薄板碰撞厚度（只有玩家从上方落下时才算实心） */
      var THIN_PLATFORM_THICKNESS = exports('THIN_PLATFORM_THICKNESS', 4);

      /** 与 TuningConfig DEFAULT_TUNING.crumble.hp / gemChunk.hp / tuning.json 默认值同步（编译期不可读 tuning）。 */
      var CRUMBLE_HP_MAX = exports('CRUMBLE_HP_MAX', 3);
      var gemChunkEvents = [];
      function consumeGemChunkEvents() {
        if (gemChunkEvents.length === 0) {
          return [];
        }
        var out = gemChunkEvents.slice();
        gemChunkEvents.length = 0;
        return out;
      }
      function gemChunkCenterWorld(spec) {
        var room = ROOM_INSTANCES[spec.roomIndex];
        return {
          x: spec.col * LEVEL_TILE_PX + LEVEL_TILE_PX,
          y: room.originY - spec.row * LEVEL_TILE_PX - LEVEL_TILE_PX
        };
      }
      function gemChunkAabb(spec) {
        var room = ROOM_INSTANCES[spec.roomIndex];
        var left = spec.col * LEVEL_TILE_PX;
        var right = left + LEVEL_TILE_PX * 2;
        var top = room.originY - spec.row * LEVEL_TILE_PX;
        var bottom = top - LEVEL_TILE_PX * 2;
        return {
          left: left,
          right: right,
          top: top,
          bottom: bottom
        };
      }
      function pointInGemChunkAabb(x, y, spec) {
        var _gemChunkAabb = gemChunkAabb(spec),
          left = _gemChunkAabb.left,
          right = _gemChunkAabb.right,
          top = _gemChunkAabb.top,
          bottom = _gemChunkAabb.bottom;
        return x >= left && x < right && y <= top && y > bottom;
      }

      /**
       * 世界坐标是否命中某个宝石堆（AABB，2×2 格 = 32×32）。
       * 命中且未碎则扣血，返回 'none' | 'hit' | 'destroyed'。
       */
      function damageGemChunkAtWorld(x, y) {
        for (var i = 0; i < GEM_CHUNK_STATES.length; i += 1) {
          var state = GEM_CHUNK_STATES[i];
          if (state.hp <= 0) {
            continue;
          }
          if (!pointInGemChunkAabb(x, y, state.spec)) {
            continue;
          }
          state.hp -= 1;
          var center = gemChunkCenterWorld(state.spec);
          if (state.hp > 0) {
            gemChunkEvents.push({
              index: i,
              kind: 'hit',
              x: center.x,
              y: center.y
            });
            return 'hit';
          }
          gemChunkEvents.push({
            index: i,
            kind: 'destroyed',
            x: center.x,
            y: center.y
          });
          return 'destroyed';
        }
        return 'none';
      }

      /**
       * 平台顶面 y：第 R 行格子占 y ∈ [-(R+1)*LEVEL_TILE_PX, -R*LEVEL_TILE_PX]，顶边为 -R*LEVEL_TILE_PX。
       */
      function platformTopY(spec) {
        return -spec.row * LEVEL_TILE_PX;
      }
      function applyPlatformSpec(grid, spec) {
        for (var i = 0; i < spec.len; i++) {
          grid[spec.row][spec.col0 + i] = 1;
        }
      }
      /** 每隔多少行放一个侧门（同时决定房间数量） */
      var PORT_SPACING_ROWS = 28;
      function buildSidePorts() {
        var ports = [];
        var i = 0;
        for (var row = 15; row <= FLOOR_START_ROW - 8; row += PORT_SPACING_ROWS) {
          var col = i % 2 === 0 ? 9 : 1;
          ports.push({
            roomIndex: i,
            col: col,
            row: row
          });
          i += 1;
        }
        return ports;
      }
      var SIDE_PORTS = exports('SIDE_PORTS', buildSidePorts());

      /** 井底传送门所在的列（地面上挖空，玩家从这里掉下去进下一关） */
      var BOTTOM_PORTAL_COLS = exports('BOTTOM_PORTAL_COLS', [4, 5, 6]);
      var ROOM_EXITS = exports('ROOM_EXITS', SIDE_PORTS.map(function (port, i) {
        return {
          roomIndex: i,
          row: 15,
          col: port.col === 9 ? 1 : 9
        };
      }));

      /**
       * 房间里的宝石堆：2×2 格，3 发打碎，碎后爆 4 颗宝石。
       */
      function buildGemChunks() {
        var chunks = [];
        for (var i = 0; i < SIDE_PORTS.length; i += 1) {
          chunks.push({
            roomIndex: i,
            row: 9,
            col: 7
          });
          chunks.push({
            roomIndex: i,
            row: 14,
            col: 5
          });
        }
        return chunks;
      }
      var GEM_CHUNKS = exports('GEM_CHUNKS', buildGemChunks());
      var GEM_CHUNK_STATES = exports('GEM_CHUNK_STATES', GEM_CHUNKS.map(function (spec) {
        return {
          spec: spec,
          hp: CRUMBLE_HP_MAX
        };
      }));
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
        for (var _iterator = _createForOfIteratorHelperLoose(PLATFORM_SPECS), _step; !(_step = _iterator()).done;) {
          var spec = _step.value;
          applyPlatformSpec(grid, spec);
        }
        for (var _iterator2 = _createForOfIteratorHelperLoose(SIDE_PORTS), _step2; !(_step2 = _iterator2()).done;) {
          var port = _step2.value;
          grid[port.row][port.col] = 0;
        }
        // 地面是 FLOOR_START_ROW..LEVEL_ROWS-1 共 3 行，必须整层挖穿，否则玩家踩在上面掉不下去
        for (var _row = FLOOR_START_ROW; _row < LEVEL_ROWS; _row += 1) {
          for (var _i = 0, _BOTTOM_PORTAL_COLS = BOTTOM_PORTAL_COLS; _i < _BOTTOM_PORTAL_COLS.length; _i++) {
            var _col = _BOTTOM_PORTAL_COLS[_i];
            grid[_row][_col] = 0;
          }
        }
        return grid;
      }

      /** 井底传送门中心的世界坐标 */
      function bottomPortalCenter() {
        var mid = BOTTOM_PORTAL_COLS[1];
        return {
          x: mid * LEVEL_TILE_PX + LEVEL_TILE_PX / 2,
          y: -FLOOR_START_ROW * LEVEL_TILE_PX - LEVEL_TILE_PX / 2
        };
      }
      var LEVEL_GRID = exports('LEVEL_GRID', buildLevelGrid());
      var ROOM_COLS = exports('ROOM_COLS', 11);
      var ROOM_ROWS = exports('ROOM_ROWS', 17);
      var ROOM_GAP = exports('ROOM_GAP', 64);
      /** 侧室整体放在井底以下，避免与加深的井内行坐标重叠 */
      var ROOM_BASE_Y = exports('ROOM_BASE_Y', -LEVEL_ROWS * LEVEL_TILE_PX - ROOM_GAP);
      var ROOM_CRUMBLE_SPECS = [{
        row: 6,
        col0: 1,
        len: 3
      }, {
        row: 11,
        col0: 7,
        len: 3
      }, {
        row: 13,
        col0: 2,
        len: 3
      }];

      /** 房间布局：四周墙 + 底 + 顶入口 + 可破坏薄台 */
      function buildRoomGrid() {
        var grid = [];
        for (var row = 0; row < ROOM_ROWS; row += 1) {
          var cells = [];
          for (var col = 0; col < ROOM_COLS; col += 1) {
            var solid = 0;
            if (col === 0 || col === ROOM_COLS - 1) {
              solid = 1;
            } else if (row === ROOM_ROWS - 1) {
              solid = 1;
            } else if (row === 0) {
              solid = col === 4 || col === 5 || col === 6 ? 0 : 1;
            }
            cells.push(solid);
          }
          grid.push(cells);
        }
        for (var _iterator3 = _createForOfIteratorHelperLoose(ROOM_CRUMBLE_SPECS), _step3; !(_step3 = _iterator3()).done;) {
          var spec = _step3.value;
          for (var i = 0; i < spec.len; i += 1) {
            grid[spec.row][spec.col0 + i] = 1;
          }
        }
        for (var _iterator4 = _createForOfIteratorHelperLoose(ROOM_EXITS), _step4; !(_step4 = _iterator4()).done;) {
          var exit = _step4.value;
          grid[exit.row][exit.col] = 0;
        }
        return grid;
      }
      function buildRoomCrumble(grid) {
        var table = [];
        for (var row = 0; row < ROOM_ROWS; row += 1) {
          var cells = [];
          for (var col = 0; col < ROOM_COLS; col += 1) {
            cells.push(0);
          }
          table.push(cells);
        }
        for (var _i2 = 0, _ROOM_CRUMBLE_SPECS = ROOM_CRUMBLE_SPECS; _i2 < _ROOM_CRUMBLE_SPECS.length; _i2++) {
          var spec = _ROOM_CRUMBLE_SPECS[_i2];
          for (var i = 0; i < spec.len; i += 1) {
            table[spec.row][spec.col0 + i] = CRUMBLE_HP_MAX;
          }
        }
        return table;
      }
      function buildRoomInstances() {
        var rooms = [];
        var stride = ROOM_ROWS * LEVEL_TILE_PX + ROOM_GAP;
        for (var i = 0; i < SIDE_PORTS.length; i += 1) {
          var grid = buildRoomGrid();
          rooms.push({
            index: i,
            originY: ROOM_BASE_Y - i * stride,
            grid: grid,
            crumble: buildRoomCrumble(),
            kind: 'gem'
          });
        }
        return rooms;
      }
      var ROOM_INSTANCES = exports('ROOM_INSTANCES', buildRoomInstances());
      function buildCrumbleTable() {
        var table = [];
        for (var row = 0; row < LEVEL_ROWS; row += 1) {
          var cells = [];
          for (var col = 0; col < LEVEL_COLS; col += 1) {
            cells.push(0);
          }
          table.push(cells);
        }
        for (var _iterator5 = _createForOfIteratorHelperLoose(PLATFORM_SPECS), _step5; !(_step5 = _iterator5()).done;) {
          var spec = _step5.value;
          for (var i = 0; i < spec.len; i += 1) {
            table[spec.row][spec.col0 + i] = CRUMBLE_HP_MAX;
          }
        }
        return table;
      }

      /**
       * 每格可承受的子弹数；0 = 不可破坏。
       * 只有 PLATFORM_SPECS 摆出来的厚平台可破坏，墙体/井底不可破坏。
       */
      var LEVEL_CRUMBLE = exports('LEVEL_CRUMBLE', buildCrumbleTable());
      var crumbleEvents = [];

      /** LevelView 每帧取走全部事件并做视觉表现 */
      function consumeCrumbleEvents() {
        if (crumbleEvents.length === 0) {
          return [];
        }
        var out = crumbleEvents.slice();
        crumbleEvents.length = 0;
        return out;
      }

      /** 被打中一次；返回 'none' | 'hit' | 'destroyed' */
      function damageCell(row, col) {
        if (row < 0 || row >= LEVEL_ROWS || col < 0 || col >= LEVEL_COLS) {
          return 'none';
        }
        if (LEVEL_CRUMBLE[row][col] === 0) {
          return 'none';
        }
        LEVEL_CRUMBLE[row][col] -= 1;
        if (LEVEL_CRUMBLE[row][col] > 0) {
          crumbleEvents.push({
            row: row,
            col: col,
            kind: 'hit'
          });
          return 'hit';
        }
        LEVEL_GRID[row][col] = 0;
        LEVEL_CRUMBLE[row][col] = 0;
        crumbleEvents.push({
          row: row,
          col: col,
          kind: 'destroyed'
        });
        return 'destroyed';
      }
      function resolveWorldCell(x, y) {
        var col = Math.floor(x / LEVEL_TILE_PX);
        if (col < 0 || col >= LEVEL_COLS) {
          return null;
        }
        if (y <= 0 && y > -LEVEL_ROWS * LEVEL_TILE_PX) {
          var row = Math.floor(-y / LEVEL_TILE_PX);
          if (row < 0 || row >= LEVEL_ROWS) {
            return null;
          }
          return {
            zone: 'well',
            row: row,
            col: col
          };
        }
        var roomH = ROOM_ROWS * LEVEL_TILE_PX;
        for (var _iterator6 = _createForOfIteratorHelperLoose(ROOM_INSTANCES), _step6; !(_step6 = _iterator6()).done;) {
          var room = _step6.value;
          if (y <= room.originY && y > room.originY - roomH) {
            var _row2 = Math.floor((room.originY - y) / LEVEL_TILE_PX);
            if (_row2 < 0 || _row2 >= ROOM_ROWS) {
              continue;
            }
            return {
              zone: 'room',
              row: _row2,
              col: col,
              roomIndex: room.index
            };
          }
        }
        return null;
      }

      /** 世界坐标 (x, y) 是否实心。子弹、玩家、敌人都改用它 */
      function solidAtWorld(x, y) {
        var cell = resolveWorldCell(x, y);
        if (!cell) {
          return false;
        }
        if (cell.zone === 'well') {
          return LEVEL_GRID[cell.row][cell.col] === 1;
        }
        var room = ROOM_INSTANCES[cell.roomIndex];
        return room.grid[cell.row][cell.col] === 1;
      }

      /** 世界坐标处可破坏格的剩余血量；0 = 不可破坏或已破坏 */
      function crumbleHpAtWorld(x, y) {
        var cell = resolveWorldCell(x, y);
        if (!cell) {
          return 0;
        }
        if (cell.zone === 'well') {
          return LEVEL_CRUMBLE[cell.row][cell.col];
        }
        return ROOM_INSTANCES[cell.roomIndex].crumble[cell.row][cell.col];
      }
      function damageRoomCell(roomIndex, row, col) {
        var room = ROOM_INSTANCES[roomIndex];
        if (room.crumble[row][col] === 0) {
          return 'none';
        }
        room.crumble[row][col] -= 1;
        if (room.crumble[row][col] > 0) {
          crumbleEvents.push({
            row: row,
            col: col,
            kind: 'hit',
            roomIndex: roomIndex
          });
          return 'hit';
        }
        room.grid[row][col] = 0;
        room.crumble[row][col] = 0;
        crumbleEvents.push({
          row: row,
          col: col,
          kind: 'destroyed',
          roomIndex: roomIndex
        });
        return 'destroyed';
      }

      /** 世界坐标处打一次；内部换算到井/房间后调用 damageCell 的等价逻辑 */
      function damageAtWorld(x, y) {
        var cell = resolveWorldCell(x, y);
        if (!cell) {
          return 'none';
        }
        if (cell.zone === 'well') {
          return damageCell(cell.row, cell.col);
        }
        return damageRoomCell(cell.roomIndex, cell.row, cell.col);
      }

      /** 出生点：第 2 行、9 格内宽水平居中（x 16~160，中心 88）。 */
      var SPAWN_POS = exports('SPAWN_POS', {
        x: 88,
        y: -32
      });
      function maxConsecutiveEmptyInPlayable(row) {
        var best = 0;
        var run = 0;
        for (var col = PLAYABLE_COL0; col <= PLAYABLE_COL1; col++) {
          if (row[col] === 0) {
            run += 1;
            if (run > best) {
              best = run;
            }
          } else {
            run = 0;
          }
        }
        return best;
      }
      function assertLevel() {
        if (LEVEL_GRID.length !== LEVEL_ROWS) {
          console.error("[LevelData] LEVEL_GRID rows " + LEVEL_GRID.length + " !== " + LEVEL_ROWS);
        }
        for (var row = 0; row < LEVEL_GRID.length; row++) {
          if (LEVEL_GRID[row].length !== LEVEL_COLS) {
            console.error("[LevelData] row " + row + " length " + LEVEL_GRID[row].length + " !== " + LEVEL_COLS);
          }
        }
        var leftWallCols = 0;
        var rightWallCols = 0;
        for (var col = 0; col < LEVEL_COLS; col++) {
          if (LEVEL_GRID[0][col] === 1) {
            if (col < PLAYABLE_COL0) {
              leftWallCols += 1;
            } else if (col > PLAYABLE_COL1) {
              rightWallCols += 1;
            }
          }
        }
        var playableWidth = PLAYABLE_COL1 - PLAYABLE_COL0 + 1;
        if (leftWallCols !== WALL_THICKNESS || rightWallCols !== WALL_THICKNESS || playableWidth !== 9) {
          console.error("[LevelData] wall/playable mismatch left=" + leftWallCols + " right=" + rightWallCols + " playable=" + playableWidth);
        }
        console.log("[LevelData] cols=" + LEVEL_COLS + " wall=" + WALL_THICKNESS + " playable=" + playableWidth + " rows=" + LEVEL_ROWS);
        var spawnCol = Math.floor(SPAWN_POS.x / LEVEL_TILE_PX);
        var spawnRow = Math.floor(-SPAWN_POS.y / LEVEL_TILE_PX);
        if (spawnRow < 0 || spawnRow >= LEVEL_ROWS || spawnCol < 0 || spawnCol >= LEVEL_COLS) {
          console.error("[LevelData] spawn out of bounds at row " + spawnRow + " col " + spawnCol);
        } else if (LEVEL_GRID[spawnRow][spawnCol] === 1) {
          console.error("[LevelData] spawn sits in solid at row " + spawnRow + " col " + spawnCol);
        }
        for (var _row3 = 0; _row3 <= 5; _row3++) {
          for (var _col2 = PLAYABLE_COL0; _col2 <= PLAYABLE_COL1; _col2++) {
            if (LEVEL_GRID[_row3][_col2] === 1) {
              console.error("[LevelData] row 0~5 must be empty in playable cols; solid at row " + _row3 + " col " + _col2);
            }
          }
        }
        for (var _row4 = 0; _row4 < FLOOR_START_ROW; _row4++) {
          var maxEmpty = maxConsecutiveEmptyInPlayable(LEVEL_GRID[_row4]);
          if (maxEmpty < 2) {
            console.error("[LevelData] row " + _row4 + " has no run of 2+ consecutive empty tiles in playable cols (max=" + maxEmpty + ")");
          }
        }
        for (var _iterator7 = _createForOfIteratorHelperLoose(PLATFORM_SPECS), _step7; !(_step7 = _iterator7()).done;) {
          var spec = _step7.value;
          var colEnd = spec.col0 + spec.len - 1;
          if (spec.col0 < PLAYABLE_COL0 || colEnd > PLAYABLE_COL1) {
            console.error("[LevelData] platform at row " + spec.row + " out of playable cols: col0=" + spec.col0 + " len=" + spec.len);
          }
        }
        if (ROOM_INSTANCES.length !== SIDE_PORTS.length) {
          console.error("[LevelData] ROOM_INSTANCES.length " + ROOM_INSTANCES.length + " !== SIDE_PORTS.length " + SIDE_PORTS.length);
        }
        for (var _iterator8 = _createForOfIteratorHelperLoose(ROOM_INSTANCES), _step8; !(_step8 = _iterator8()).done;) {
          var room = _step8.value;
          if (room.grid.length !== ROOM_ROWS) {
            console.error("[LevelData] room " + room.index + " grid rows " + room.grid.length + " !== " + ROOM_ROWS);
          }
          for (var r = 0; r < room.grid.length; r += 1) {
            if (room.grid[r].length !== ROOM_COLS) {
              console.error("[LevelData] room " + room.index + " row " + r + " length " + room.grid[r].length + " !== " + ROOM_COLS);
            }
          }
        }
        for (var _iterator9 = _createForOfIteratorHelperLoose(SIDE_PORTS), _step9; !(_step9 = _iterator9()).done;) {
          var port = _step9.value;
          var _cx = port.col * LEVEL_TILE_PX + LEVEL_TILE_PX / 2;
          var _cy = -port.row * LEVEL_TILE_PX - LEVEL_TILE_PX / 2;
          if (solidAtWorld(_cx, _cy)) {
            console.error("[LevelData] SIDE_PORT row=" + port.row + " col=" + port.col + " not carved (solid)");
          }
        }
        if (ROOM_EXITS.length !== SIDE_PORTS.length) {
          console.error("[LevelData] ROOM_EXITS.length " + ROOM_EXITS.length + " !== SIDE_PORTS.length " + SIDE_PORTS.length);
        }
        // 出口格必须可穿越（挖空）
        for (var _iterator10 = _createForOfIteratorHelperLoose(ROOM_EXITS), _step10; !(_step10 = _iterator10()).done;) {
          var exit = _step10.value;
          var _room = ROOM_INSTANCES[exit.roomIndex];
          if (!_room) {
            console.error("[LevelData] ROOM_EXIT missing room " + exit.roomIndex);
            continue;
          }
          var _cy2 = _room.originY - exit.row * LEVEL_TILE_PX - LEVEL_TILE_PX / 2;
          var _cx2 = exit.col * LEVEL_TILE_PX + LEVEL_TILE_PX / 2;
          if (solidAtWorld(_cx2, _cy2)) {
            console.error("[LevelData] room exit " + exit.roomIndex + " (" + exit.row + "," + exit.col + ") is still solid");
          }
        }
        console.log("[LevelData] exits cleared=" + ROOM_EXITS.length);
        var expectedGemChunks = SIDE_PORTS.length * 2;
        if (GEM_CHUNKS.length !== expectedGemChunks) {
          console.error("[LevelData] GEM_CHUNKS.length " + GEM_CHUNKS.length + " !== " + expectedGemChunks);
        }
        var _loop = function _loop() {
          var spec = GEM_CHUNKS[ci];
          for (var dr = 0; dr < 2; dr += 1) {
            for (var dc = 0; dc < 2; dc += 1) {
              var _row6 = spec.row + dr;
              var _col4 = spec.col + dc;
              var _cx3 = _col4 * LEVEL_TILE_PX + LEVEL_TILE_PX / 2;
              var _cy3 = ROOM_INSTANCES[spec.roomIndex].originY - _row6 * LEVEL_TILE_PX - LEVEL_TILE_PX / 2;
              if (solidAtWorld(_cx3, _cy3)) {
                console.error("[LevelData] gem chunk " + ci + " cell (" + _row6 + "," + _col4 + ") is solid (blocks movement)");
              }
            }
          }
          var exit = ROOM_EXITS.find(function (e) {
            return e.roomIndex === spec.roomIndex;
          });
          if (exit) {
            for (var _dr = 0; _dr < 2; _dr += 1) {
              for (var _dc = 0; _dc < 2; _dc += 1) {
                var _row7 = spec.row + _dr;
                var _col5 = spec.col + _dc;
                if (_row7 === exit.row && _col5 === exit.col) {
                  console.error("[LevelData] gem chunk " + ci + " overlaps room exit at (" + exit.row + "," + exit.col + ")");
                }
              }
            }
          }
        };
        for (var ci = 0; ci < GEM_CHUNKS.length; ci += 1) {
          _loop();
        }
        // 宝石堆正上方必须没有实心格，否则子弹打不到（只能从上往下打）
        for (var _iterator11 = _createForOfIteratorHelperLoose(GEM_CHUNKS), _step11; !(_step11 = _iterator11()).done;) {
          var _spec = _step11.value;
          var _room2 = ROOM_INSTANCES[_spec.roomIndex];
          var minRow = Math.max(0, _spec.row - 8);
          for (var _row8 = _spec.row - 1; _row8 >= minRow; _row8 -= 1) {
            for (var c = _spec.col; c < _spec.col + 2; c += 1) {
              if (_room2.grid[_row8][c] === 1) {
                console.error("[LevelData] gemChunk r" + _spec.roomIndex + " (" + _spec.row + "," + _spec.col + ") blocked at (" + _row8 + "," + c + ")");
              }
            }
          }
        }
        console.log("[LevelData] gemChunk lanes clear=" + GEM_CHUNKS.length);
        console.log("[LevelData] gemChunks=" + GEM_CHUNKS.length);
        var bp = bottomPortalCenter();
        if (solidAtWorld(bp.x, bp.y)) {
          console.error("[LevelData] bottom portal center (" + bp.x + "," + bp.y + ") is solid");
        }
        for (var _row5 = FLOOR_START_ROW; _row5 < LEVEL_ROWS; _row5 += 1) {
          for (var _iterator12 = _createForOfIteratorHelperLoose(BOTTOM_PORTAL_COLS), _step12; !(_step12 = _iterator12()).done;) {
            var _col3 = _step12.value;
            var cx = _col3 * LEVEL_TILE_PX + LEVEL_TILE_PX / 2;
            var cy = -_row5 * LEVEL_TILE_PX - LEVEL_TILE_PX / 2;
            if (solidAtWorld(cx, cy)) {
              console.error("[LevelData] bottom portal row " + _row5 + " col " + _col3 + " center is solid");
            }
          }
        }
        console.log('[LevelData] bottom portal open 3x3 at cols=4,5,6');
        console.log("[LevelData] screens=" + LEVEL_SCREENS + " rows=" + LEVEL_ROWS + " platforms=" + PLATFORM_SPECS.length + " thin=" + THIN_PLATFORM_SPECS.length + " ports=" + SIDE_PORTS.length + " rooms=" + ROOM_INSTANCES.length + " gemChunks=" + GEM_CHUNKS.length);
      }
      assertLevel();
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelFlow.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './RunState.ts', './TuningConfig.ts', './LevelData.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, Node, Layers, UITransform, UIOpacity, assetManager, SpriteFrame, Sprite, Color, director, Component, FixedStepDriver, runState, getTuning, LEVEL_ROWS, LEVEL_TILE_PX, PlayerController;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      UIOpacity = module.UIOpacity;
      assetManager = module.assetManager;
      SpriteFrame = module.SpriteFrame;
      Sprite = module.Sprite;
      Color = module.Color;
      director = module.director;
      Component = module.Component;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      runState = module.runState;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      LEVEL_ROWS = module.LEVEL_ROWS;
      LEVEL_TILE_PX = module.LEVEL_TILE_PX;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "3e17awdU3hMeblk33qmOY3c", "LevelFlow", undefined);
      var ccclass = _decorator.ccclass;
      var LevelFlow = exports('LevelFlow', (_dec = ccclass('LevelFlow'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LevelFlow, _Component);
        function LevelFlow() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._state = 'idle';
          _this._t = 0;
          _this._loadSceneCalled = false;
          _this._stepBound = false;
          _this._fadeOverlay = null;
          _this._fadeOpacity = null;
          return _this;
        }
        var _proto = LevelFlow.prototype;
        _proto.onLoad = function onLoad() {
          this._createFadeOverlay();
          this._bindStep();
          if (typeof window !== 'undefined') {
            window.__dwLevelFlow = this;
          }
        };
        _proto._createFadeOverlay = function _createFadeOverlay() {
          var canvas = find('Canvas');
          if (!canvas) {
            console.error('[LevelFlow] Canvas not found for FadeOverlay');
            return;
          }
          var node = new Node('FadeOverlay');
          node.layer = Layers.Enum.UI_2D;
          canvas.addChild(node);
          node.setSiblingIndex(canvas.children.length - 1);
          var ut = node.addComponent(UITransform);
          ut.setContentSize(160, 284);
          var opacity = node.addComponent(UIOpacity);
          opacity.opacity = 0;
          this._fadeOpacity = opacity;
          this._fadeOverlay = node;
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[LevelFlow] loadBundle failed for FadeOverlay', bundleErr);
              return;
            }
            bundle.load('sprite/tile/tile_00/spriteFrame', SpriteFrame, function (loadErr, frame) {
              if (loadErr || !frame) {
                console.error('[LevelFlow] tile_00 load failed for FadeOverlay', loadErr);
                return;
              }
              var sprite = node.addComponent(Sprite);
              sprite.spriteFrame = frame;
              sprite.color = new Color(0, 0, 0, 255);
            });
          });
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[LevelFlow] FixedStepDriver not found on Game');
            return;
          }
          driver.registerOnStep(function () {
            if (_this2.enabled && _this2.node.activeInHierarchy) {
              _this2._step();
            }
          });
          this._stepBound = true;
        };
        _proto._playerY = function _playerY() {
          var _find$getComponent, _find;
          var player = (_find$getComponent = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(PlayerController)) != null ? _find$getComponent : null;
          if (!player) {
            return null;
          }
          return player._y;
        };
        _proto._step = function _step() {
          var flow = getTuning().flow;
          var floorY = -LEVEL_ROWS * LEVEL_TILE_PX;
          if (this._state === 'idle') {
            var py = this._playerY();
            if (py === null) {
              return;
            }
            if (py < floorY - flow.triggerDepth) {
              this._state = 'fadeOut';
              this._t = 0;
            }
            return;
          }
          if (this._state === 'fadeOut') {
            this._t += 1;
            var fadeSteps = flow.fadeSteps;
            if (this._fadeOpacity) {
              this._fadeOpacity.opacity = Math.min(255, Math.floor(255 * this._t / fadeSteps));
            }
            if (this._t >= fadeSteps) {
              this._state = 'loading';
              this._beginLoadScene();
            }
            return;
          }
          if (this._state === 'loading') {
            return;
          }
        };
        _proto._beginLoadScene = function _beginLoadScene() {
          if (this._loadSceneCalled) {
            return;
          }
          this._loadSceneCalled = true;
          runState.level += 1;
          director.loadScene('Main');
        };
        _createClass(LevelFlow, [{
          key: "state",
          get: function get() {
            return this._state;
          }
        }, {
          key: "fadeOverlay",
          get: function get() {
            return this._fadeOverlay;
          }
        }]);
        return LevelFlow;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelHud.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './RunState.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Label, Component, runState;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      Component = module.Component;
    }, function (module) {
      runState = module.runState;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "7f4702rH4RDlrJsJLsOAYUZ", "LevelHud", undefined);
      var ccclass = _decorator.ccclass;
      var LevelHud = exports('LevelHud', (_dec = ccclass('LevelHud'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LevelHud, _Component);
        function LevelHud() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._label = null;
          _this._last = -1;
          return _this;
        }
        var _proto = LevelHud.prototype;
        _proto.onLoad = function onLoad() {
          this._label = this.getComponent(Label);
        };
        _proto.update = function update() {
          if (!this._label || runState.level === this._last) {
            return;
          }
          this._last = runState.level;
          this._label.string = "LEVEL " + runState.level;
        };
        return LevelHud;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/LevelView.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './TuningConfig.ts', './FixedStepDriver.ts', './LevelData.ts', './GemManager.ts'], function (exports) {
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, Color, Graphics, assetManager, Prefab, Node, UITransform, Sprite, find, instantiate, SpriteFrame, Component, getTuning, FixedStepDriver, assertLevel, consumeCrumbleEvents, consumeGemChunkEvents, GEM_CHUNKS, ROOM_INSTANCES, LEVEL_TILE_PX, ROOM_EXITS, SIDE_PORTS, LEVEL_GRID, LEVEL_CRUMBLE, THIN_PLATFORM_SPECS, bottomPortalCenter, GemManager;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Color = module.Color;
      Graphics = module.Graphics;
      assetManager = module.assetManager;
      Prefab = module.Prefab;
      Node = module.Node;
      UITransform = module.UITransform;
      Sprite = module.Sprite;
      find = module.find;
      instantiate = module.instantiate;
      SpriteFrame = module.SpriteFrame;
      Component = module.Component;
    }, function (module) {
      getTuning = module.getTuning;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      assertLevel = module.assertLevel;
      consumeCrumbleEvents = module.consumeCrumbleEvents;
      consumeGemChunkEvents = module.consumeGemChunkEvents;
      GEM_CHUNKS = module.GEM_CHUNKS;
      ROOM_INSTANCES = module.ROOM_INSTANCES;
      LEVEL_TILE_PX = module.LEVEL_TILE_PX;
      ROOM_EXITS = module.ROOM_EXITS;
      SIDE_PORTS = module.SIDE_PORTS;
      LEVEL_GRID = module.LEVEL_GRID;
      LEVEL_CRUMBLE = module.LEVEL_CRUMBLE;
      THIN_PLATFORM_SPECS = module.THIN_PLATFORM_SPECS;
      bottomPortalCenter = module.bottomPortalCenter;
    }, function (module) {
      GemManager = module.GemManager;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "b4a195sjS9McaPlnwttTCoX", "LevelView", undefined);
      var ccclass = _decorator.ccclass;
      var CRUMBLE_FRAME_COUNT = 4;
      var PORTAL_FRAME_COUNT = 16;
      var GEM_CHUNK_IDLE_FRAME_COUNT = 4;
      var GEM_CHUNK_BREAK_FRAME_COUNT = 2;
      var GEM_CHUNK_FRAME_COUNT = GEM_CHUNK_IDLE_FRAME_COUNT + GEM_CHUNK_BREAK_FRAME_COUNT;
      var TILE_WHITE = new Color(255, 255, 255, 255);
      var CRUMBLE_HIT_FLASH = new Color(255, 120, 120, 255);
      var GEM_CHUNK_HIT_FLASH = new Color(255, 140, 140, 255);
      var LevelView = exports('LevelView', (_dec = ccclass('LevelView'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(LevelView, _Component);
        function LevelView() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._tileMap = new Map();
          _this._crumbleFrames = [];
          _this._crumbleFramesReady = false;
          _this._flashSteps = new Map();
          _this._destroyAnims = new Map();
          _this._portalSprites = [];
          _this._portalFrames = [];
          _this._portalAnimStep = 0;
          _this._portalStepBound = false;
          _this._gemChunkFrames = [];
          _this._gemChunkFramesReady = false;
          _this._gemChunkMap = new Map();
          _this._gemChunkFlashSteps = new Map();
          _this._gemChunkDestroyAnims = new Map();
          _this._gemChunkIdleStep = 0;
          _this._gemChunkIdleFrame = 0;
          _this._cullables = [];
          _this._cullStep = 0;
          return _this;
        }
        var _proto = LevelView.prototype;
        _proto.onLoad = function onLoad() {
          var _this2 = this;
          assertLevel();
          this._bindPortalStep();
          var graphics = this.getComponent(Graphics);
          if (graphics) {
            graphics.enabled = false;
          }
          window.__dwTiles = this.node;
          var tileSize = LEVEL_TILE_PX;
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[LevelView] tile prefab/frames load failed: ' + bundleErr);
              return;
            }
            _this2._loadCrumbleFrames(bundle);
            _this2._loadGemChunkFrames(bundle);
            bundle.load('prefab/Tile', Prefab, function (prefabErr, tilePrefab) {
              if (prefabErr || !tilePrefab) {
                console.error('[LevelView] tile prefab/frames load failed: ' + prefabErr);
                return;
              }
              var pending = 8;
              var frames = new Array(8).fill(null);
              var frameLoadErr = null;
              var _loop = function _loop(i) {
                var path = "sprite/tile/tile_" + String(i).padStart(2, '0') + "/spriteFrame";
                bundle.load(path, SpriteFrame, function (loadErr, frame) {
                  if (loadErr || !frame) {
                    frameLoadErr = loadErr != null ? loadErr : "missing " + path;
                  } else {
                    frames[i] = frame;
                  }
                  pending -= 1;
                  if (pending === 0) {
                    if (frameLoadErr || frames.some(function (f) {
                      return !f;
                    })) {
                      console.error('[LevelView] tile prefab/frames load failed: ' + frameLoadErr);
                      return;
                    }
                    _this2._buildTileSprites(tilePrefab, frames, tileSize);
                    _this2._buildRoomTiles(tilePrefab, frames, tileSize);
                    _this2._refreshCullNow();
                    _this2._loadPortalFrames(bundle, tilePrefab, tileSize);
                    bundle.load('sprite/platform/thin_platform/spriteFrame', SpriteFrame, function (thinErr, thinFrame) {
                      if (thinErr || !thinFrame) {
                        console.error('[LevelView] thin platform frame load failed: ' + thinErr);
                        return;
                      }
                      _this2._buildThinPlatforms(tilePrefab, thinFrame, tileSize);
                      _this2._refreshCullNow();
                    });
                  }
                });
              };
              for (var i = 0; i < 8; i += 1) {
                _loop(i);
              }
            });
          });
        };
        _proto.update = function update() {
          this._cull();
          var events = consumeCrumbleEvents();
          for (var _iterator = _createForOfIteratorHelperLoose(events), _step; !(_step = _iterator()).done;) {
            var ev = _step.value;
            this._onCrumble(ev);
          }
          this._stepCrumbleAnims();
          var gemEvents = consumeGemChunkEvents();
          for (var _iterator2 = _createForOfIteratorHelperLoose(gemEvents), _step2; !(_step2 = _iterator2()).done;) {
            var _ev = _step2.value;
            this._onGemChunk(_ev);
          }
          this._stepGemChunkAnims();
        };
        _proto._registerCullable = function _registerCullable(node, y) {
          this._cullables.push({
            node: node,
            y: y
          });
        };
        _proto._camYForCull = function _camYForCull() {
          var world = this.node.parent;
          if (!world) {
            return null;
          }
          return getTuning().render.designHeight / 2 - world.position.y;
        };
        _proto._applyCull = function _applyCull(camY) {
          var margin = getTuning().level.cullMarginPx;
          var halfView = getTuning().render.designHeight / 2 + margin;
          for (var i = 0; i < this._cullables.length; i += 1) {
            var c = this._cullables[i];
            if (!c.node.isValid) {
              continue;
            }
            var visible = Math.abs(c.y - camY) <= halfView;
            if (c.node.active !== visible) {
              c.node.active = visible;
            }
          }
        };
        _proto._refreshCullNow = function _refreshCullNow() {
          var camY = this._camYForCull();
          if (camY === null) {
            return;
          }
          this._applyCull(camY);
        };
        _proto._cull = function _cull() {
          this._cullStep = (this._cullStep + 1) % 3;
          if (this._cullStep !== 0) {
            return;
          }
          var camY = this._camYForCull();
          if (camY === null) {
            return;
          }
          this._applyCull(camY);
        };
        _proto._loadCrumbleFrames = function _loadCrumbleFrames(bundle) {
          var _this3 = this;
          var pending = CRUMBLE_FRAME_COUNT;
          var loaded = new Array(CRUMBLE_FRAME_COUNT).fill(null);
          var loadErr = null;
          var _loop2 = function _loop2(i) {
            var path = "sprite/platform/crumble_" + String(i).padStart(2, '0') + "/spriteFrame";
            bundle.load(path, SpriteFrame, function (err, frame) {
              if (err || !frame) {
                loadErr = err != null ? err : "missing " + path;
              } else {
                loaded[i] = frame;
              }
              pending -= 1;
              if (pending === 0) {
                if (loadErr || loaded.some(function (f) {
                  return !f;
                })) {
                  console.error('[LevelView] crumble frames load failed: ' + loadErr);
                  return;
                }
                _this3._crumbleFrames = loaded;
                _this3._crumbleFramesReady = true;
              }
            });
          };
          for (var i = 0; i < CRUMBLE_FRAME_COUNT; i += 1) {
            _loop2(i);
          }
        };
        _proto._loadGemChunkFrames = function _loadGemChunkFrames(bundle) {
          var _this4 = this;
          var pending = GEM_CHUNK_FRAME_COUNT;
          var loaded = new Array(GEM_CHUNK_FRAME_COUNT).fill(null);
          var loadErr = null;
          var paths = [];
          for (var i = 0; i < GEM_CHUNK_IDLE_FRAME_COUNT; i += 1) {
            paths.push("sprite/gemchunk/chunk_idle_" + String(i).padStart(2, '0') + "/spriteFrame");
          }
          for (var _i = 0; _i < GEM_CHUNK_BREAK_FRAME_COUNT; _i += 1) {
            paths.push("sprite/gemchunk/chunk_break_" + String(_i).padStart(2, '0') + "/spriteFrame");
          }
          var _loop3 = function _loop3(_i2) {
            bundle.load(paths[_i2], SpriteFrame, function (err, frame) {
              if (err || !frame) {
                loadErr = err != null ? err : "missing " + paths[_i2];
              } else {
                loaded[_i2] = frame;
              }
              pending -= 1;
              if (pending === 0) {
                if (loadErr || loaded.some(function (f) {
                  return !f;
                })) {
                  console.error('[LevelView] gem chunk frames load failed: ' + loadErr);
                  return;
                }
                _this4._gemChunkFrames = loaded;
                _this4._gemChunkFramesReady = true;
                _this4._buildGemChunks();
              }
            });
          };
          for (var _i2 = 0; _i2 < paths.length; _i2 += 1) {
            _loop3(_i2);
          }
        };
        _proto._buildGemChunks = function _buildGemChunks() {
          if (!this._gemChunkFramesReady || this._gemChunkFrames.length < GEM_CHUNK_FRAME_COUNT) {
            return;
          }
          for (var i = 0; i < GEM_CHUNKS.length; i += 1) {
            var spec = GEM_CHUNKS[i];
            var room = ROOM_INSTANCES[spec.roomIndex];
            if (!room) {
              continue;
            }
            var node = new Node('GemChunk');
            this.node.addChild(node);
            var ut = node.addComponent(UITransform);
            ut.setContentSize(32, 32);
            ut.setAnchorPoint(0.5, 0.5);
            var y = room.originY - spec.row * LEVEL_TILE_PX - LEVEL_TILE_PX;
            node.setPosition(spec.col * LEVEL_TILE_PX + LEVEL_TILE_PX, y);
            var sprite = node.addComponent(Sprite);
            sprite.spriteFrame = this._gemChunkFrames[0];
            sprite.color = TILE_WHITE;
            this._registerCullable(node, y);
            this._gemChunkMap.set(i, {
              node: node,
              sprite: sprite
            });
          }
          this._refreshCullNow();
        };
        _proto._onGemChunk = function _onGemChunk(ev) {
          var _find$getComponent, _find;
          var entry = this._gemChunkMap.get(ev.index);
          if (!entry) {
            return;
          }
          if (ev.kind === 'hit') {
            entry.sprite.color = GEM_CHUNK_HIT_FLASH;
            this._gemChunkFlashSteps.set(ev.index, getTuning().crumble.flashSteps);
            return;
          }
          this._gemChunkFlashSteps["delete"](ev.index);
          var gm = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(GemManager)) != null ? _find$getComponent : null;
          if (gm) {
            var count = getTuning().gemChunk.gemsPerChunk;
            for (var g = 0; g < count; g += 1) {
              var dx = g % 2 === 0 ? -6 : 6;
              var dy = Math.random() * 8;
              gm.spawnAt('small', ev.x + dx, ev.y + dy);
            }
          }
          if (!this._gemChunkFramesReady || this._gemChunkFrames.length < GEM_CHUNK_FRAME_COUNT) {
            entry.node.destroy();
            this._gemChunkMap["delete"](ev.index);
            return;
          }
          var breakBase = GEM_CHUNK_IDLE_FRAME_COUNT;
          entry.sprite.spriteFrame = this._gemChunkFrames[breakBase];
          this._gemChunkDestroyAnims.set(ev.index, {
            frame: 0,
            stepsLeft: getTuning().gemChunk.breakStepsPerFrame
          });
        };
        _proto._stepGemChunkAnims = function _stepGemChunkAnims() {
          for (var _iterator3 = _createForOfIteratorHelperLoose(this._gemChunkFlashSteps), _step3; !(_step3 = _iterator3()).done;) {
            var _step3$value = _step3.value,
              index = _step3$value[0],
              stepsLeft = _step3$value[1];
            var next = stepsLeft - 1;
            if (next <= 0) {
              this._gemChunkFlashSteps["delete"](index);
              var entry = this._gemChunkMap.get(index);
              if (entry && !this._gemChunkDestroyAnims.has(index)) {
                entry.sprite.color = TILE_WHITE;
              }
            } else {
              this._gemChunkFlashSteps.set(index, next);
            }
          }
          var breakSteps = getTuning().gemChunk.breakStepsPerFrame;
          var breakBase = GEM_CHUNK_IDLE_FRAME_COUNT;
          for (var _iterator4 = _createForOfIteratorHelperLoose(this._gemChunkDestroyAnims), _step4; !(_step4 = _iterator4()).done;) {
            var _step4$value = _step4.value,
              _index = _step4$value[0],
              anim = _step4$value[1];
            anim.stepsLeft -= 1;
            if (anim.stepsLeft > 0) {
              continue;
            }
            var _entry = this._gemChunkMap.get(_index);
            if (!_entry) {
              this._gemChunkDestroyAnims["delete"](_index);
              continue;
            }
            if (anim.frame >= GEM_CHUNK_BREAK_FRAME_COUNT - 1) {
              _entry.node.destroy();
              this._gemChunkMap["delete"](_index);
              this._gemChunkDestroyAnims["delete"](_index);
              continue;
            }
            anim.frame += 1;
            _entry.sprite.spriteFrame = this._gemChunkFrames[breakBase + anim.frame];
            anim.stepsLeft = breakSteps;
          }
          if (this._gemChunkMap.size === 0 || !this._gemChunkFramesReady) {
            return;
          }
          var idleSteps = getTuning().gemChunk.idleStepsPerFrame;
          this._gemChunkIdleStep += 1;
          if (this._gemChunkIdleStep < idleSteps) {
            return;
          }
          this._gemChunkIdleStep = 0;
          this._gemChunkIdleFrame = (this._gemChunkIdleFrame + 1) % GEM_CHUNK_IDLE_FRAME_COUNT;
          var idleFrame = this._gemChunkFrames[this._gemChunkIdleFrame];
          for (var _iterator5 = _createForOfIteratorHelperLoose(this._gemChunkMap), _step5; !(_step5 = _iterator5()).done;) {
            var _step5$value = _step5.value,
              _index2 = _step5$value[0],
              _entry2 = _step5$value[1];
            if (this._gemChunkDestroyAnims.has(_index2)) {
              continue;
            }
            _entry2.sprite.spriteFrame = idleFrame;
          }
        };
        _proto._crumbleKey = function _crumbleKey(ev) {
          if (ev.roomIndex !== undefined) {
            return "r" + ev.roomIndex + ":" + ev.row + "," + ev.col;
          }
          return ev.row + "," + ev.col;
        };
        _proto._onCrumble = function _onCrumble(ev) {
          var key = this._crumbleKey(ev);
          var entry = this._tileMap.get(key);
          if (!entry) {
            return;
          }
          if (ev.kind === 'hit') {
            entry.sprite.color = CRUMBLE_HIT_FLASH;
            this._flashSteps.set(key, getTuning().crumble.flashSteps);
            return;
          }
          this._flashSteps["delete"](key);
          if (!this._crumbleFramesReady || this._crumbleFrames.length < CRUMBLE_FRAME_COUNT) {
            entry.node.destroy();
            this._tileMap["delete"](key);
            return;
          }
          var stepsPerFrame = getTuning().crumble.animStepsPerFrame;
          entry.sprite.spriteFrame = this._crumbleFrames[0];
          this._destroyAnims.set(key, {
            frame: 0,
            stepsLeft: stepsPerFrame
          });
        };
        _proto._stepCrumbleAnims = function _stepCrumbleAnims() {
          for (var _iterator6 = _createForOfIteratorHelperLoose(this._flashSteps), _step6; !(_step6 = _iterator6()).done;) {
            var _step6$value = _step6.value,
              key = _step6$value[0],
              stepsLeft = _step6$value[1];
            var next = stepsLeft - 1;
            if (next <= 0) {
              this._flashSteps["delete"](key);
              var entry = this._tileMap.get(key);
              if (entry && !this._destroyAnims.has(key)) {
                entry.sprite.color = TILE_WHITE;
              }
            } else {
              this._flashSteps.set(key, next);
            }
          }
          var stepsPerFrame = getTuning().crumble.animStepsPerFrame;
          for (var _iterator7 = _createForOfIteratorHelperLoose(this._destroyAnims), _step7; !(_step7 = _iterator7()).done;) {
            var _step7$value = _step7.value,
              _key2 = _step7$value[0],
              anim = _step7$value[1];
            anim.stepsLeft -= 1;
            if (anim.stepsLeft > 0) {
              continue;
            }
            var _entry3 = this._tileMap.get(_key2);
            if (!_entry3) {
              this._destroyAnims["delete"](_key2);
              continue;
            }
            if (anim.frame >= CRUMBLE_FRAME_COUNT - 1) {
              _entry3.node.destroy();
              this._tileMap["delete"](_key2);
              this._destroyAnims["delete"](_key2);
              continue;
            }
            anim.frame += 1;
            _entry3.sprite.spriteFrame = this._crumbleFrames[anim.frame];
            anim.stepsLeft = stepsPerFrame;
          }
        };
        _proto._bindPortalStep = function _bindPortalStep() {
          var _this5 = this;
          if (this._portalStepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[LevelView] FixedStepDriver not found for portal anim');
            return;
          }
          driver.registerOnStep(function () {
            if (!_this5.enabled || !_this5.node.activeInHierarchy) {
              return;
            }
            if (_this5._portalSprites.length === 0 || _this5._portalFrames.length < PORTAL_FRAME_COUNT) {
              return;
            }
            _this5._portalAnimStep += 1;
            var stepsPerFrame = getTuning().room.portalAnimStepsPerFrame;
            var frame = Math.floor(_this5._portalAnimStep / stepsPerFrame) % PORTAL_FRAME_COUNT;
            var frameImg = _this5._portalFrames[frame];
            for (var i = 0; i < _this5._portalSprites.length; i += 1) {
              _this5._portalSprites[i].spriteFrame = frameImg;
            }
          });
          this._portalStepBound = true;
        };
        _proto._loadPortalFrames = function _loadPortalFrames(bundle, tilePrefab, tileSize) {
          var _this6 = this;
          var pending = PORTAL_FRAME_COUNT;
          var loaded = new Array(PORTAL_FRAME_COUNT).fill(null);
          var loadErr = null;
          var _loop4 = function _loop4(i) {
            var path = "sprite/portal/gate_" + String(i).padStart(2, '0') + "/spriteFrame";
            bundle.load(path, SpriteFrame, function (err, frame) {
              if (err || !frame) {
                loadErr = err != null ? err : "missing " + path;
              } else {
                loaded[i] = frame;
              }
              pending -= 1;
              if (pending === 0) {
                if (loadErr || loaded.some(function (f) {
                  return !f;
                })) {
                  console.error('[LevelView] portal frames load failed: ' + loadErr);
                  return;
                }
                _this6._portalFrames = loaded;
                _this6._buildSidePortals(tilePrefab, tileSize);
                _this6._buildRoomExits(tilePrefab, tileSize);
                _this6._buildBottomPortal(tilePrefab, tileSize);
              }
            });
          };
          for (var i = 0; i < PORTAL_FRAME_COUNT; i += 1) {
            _loop4(i);
          }
        };
        _proto._buildBottomPortal = function _buildBottomPortal(tilePrefab, tileSize) {
          var center = bottomPortalCenter();
          var node = instantiate(tilePrefab);
          node.name = 'BottomPortal';
          this.node.addChild(node);
          node.setPosition(center.x, center.y);
          this._registerCullable(node, center.y);
          var sprite = node.getComponent(Sprite);
          if (!sprite || this._portalFrames.length === 0) {
            return;
          }
          sprite.spriteFrame = this._portalFrames[0];
          sprite.color = TILE_WHITE;
          this._portalSprites.push(sprite);
          this._refreshCullNow();
        };
        _proto._buildRoomExits = function _buildRoomExits(tilePrefab, tileSize) {
          var half = tileSize / 2;
          for (var i = 0; i < ROOM_EXITS.length; i += 1) {
            var exit = ROOM_EXITS[i];
            var room = ROOM_INSTANCES[exit.roomIndex];
            if (!room) {
              continue;
            }
            var node = instantiate(tilePrefab);
            node.name = 'RoomExit';
            this.node.addChild(node);
            var y = room.originY - exit.row * tileSize - half;
            node.setPosition(exit.col * tileSize + half, y);
            this._registerCullable(node, y);
            var sprite = node.getComponent(Sprite);
            if (!sprite || this._portalFrames.length === 0) {
              continue;
            }
            sprite.spriteFrame = this._portalFrames[0];
            sprite.color = TILE_WHITE;
            this._portalSprites.push(sprite);
          }
        };
        _proto._buildSidePortals = function _buildSidePortals(tilePrefab, tileSize) {
          var half = tileSize / 2;
          for (var i = 0; i < SIDE_PORTS.length; i += 1) {
            var port = SIDE_PORTS[i];
            var node = instantiate(tilePrefab);
            node.name = 'SidePortal';
            this.node.addChild(node);
            var y = -port.row * tileSize - half;
            node.setPosition(port.col * tileSize + half, y);
            this._registerCullable(node, y);
            var sprite = node.getComponent(Sprite);
            if (!sprite || this._portalFrames.length === 0) {
              continue;
            }
            sprite.spriteFrame = this._portalFrames[0];
            sprite.color = TILE_WHITE;
            this._portalSprites.push(sprite);
          }
        };
        _proto._buildRoomTiles = function _buildRoomTiles(tilePrefab, frames, tileSize) {
          var half = tileSize / 2;
          for (var ri = 0; ri < ROOM_INSTANCES.length; ri += 1) {
            var room = ROOM_INSTANCES[ri];
            for (var row = 0; row < room.grid.length; row += 1) {
              var cells = room.grid[row];
              for (var col = 0; col < cells.length; col += 1) {
                if (cells[col] !== 1) {
                  continue;
                }
                var node = instantiate(tilePrefab);
                this.node.addChild(node);
                var y = room.originY - row * tileSize - half;
                node.setPosition(col * tileSize + half, y);
                this._registerCullable(node, y);
                var sprite = node.getComponent(Sprite);
                if (!sprite) {
                  continue;
                }
                var frameIndex = (row * 31 + col * 17 + ri * 3) % 8;
                sprite.spriteFrame = frames[frameIndex];
                sprite.color = TILE_WHITE;
                if (room.crumble[row][col] > 0) {
                  this._tileMap.set("r" + room.index + ":" + row + "," + col, {
                    node: node,
                    sprite: sprite
                  });
                }
              }
            }
          }
        };
        _proto._buildTileSprites = function _buildTileSprites(tilePrefab, frames, tileSize) {
          var half = tileSize / 2;
          for (var row = 0; row < LEVEL_GRID.length; row += 1) {
            var cells = LEVEL_GRID[row];
            for (var col = 0; col < cells.length; col += 1) {
              if (cells[col] !== 1) {
                continue;
              }
              var node = instantiate(tilePrefab);
              this.node.addChild(node);
              var y = -row * tileSize - half;
              node.setPosition(col * tileSize + half, y);
              this._registerCullable(node, y);
              var sprite = node.getComponent(Sprite);
              if (!sprite) {
                continue;
              }
              var frameIndex = (row * 31 + col * 17) % 8;
              sprite.spriteFrame = frames[frameIndex];
              sprite.color = TILE_WHITE;
              if (LEVEL_CRUMBLE[row][col] > 0) {
                this._tileMap.set(row + "," + col, {
                  node: node,
                  sprite: sprite
                });
              }
            }
          }
        };
        _proto._buildThinPlatforms = function _buildThinPlatforms(tilePrefab, frame, tileSize) {
          var half = tileSize / 2;
          for (var s = 0; s < THIN_PLATFORM_SPECS.length; s += 1) {
            var spec = THIN_PLATFORM_SPECS[s];
            for (var i = 0; i < spec.len; i += 1) {
              var node = instantiate(tilePrefab);
              node.name = 'ThinPlatform';
              this.node.addChild(node);
              var col = spec.col0 + i;
              var y = -spec.row * tileSize;
              node.setPosition(col * tileSize + half, y);
              this._registerCullable(node, y);
              var ut = node.getComponent(UITransform);
              if (ut) {
                ut.setAnchorPoint(0.5, 1);
                ut.setContentSize(24, 9);
              }
              var sprite = node.getComponent(Sprite);
              if (!sprite) {
                continue;
              }
              sprite.spriteFrame = frame;
              sprite.color = new Color(255, 255, 255, 255);
            }
          }
        };
        return LevelView;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./AudioManager.ts', './FixedStepDriver.ts', './InputState.ts', './KeyboardInput.ts', './RunState.ts', './TuningConfig.ts', './ViewBootstrap.ts', './stepAccumulator.ts', './Bullet.ts', './BulletPool.ts', './ComboTracker.ts', './Enemy.ts', './EnemyManager.ts', './Gem.ts', './GemManager.ts', './Gunboots.ts', './LevelData.ts', './LevelFlow.ts', './LevelView.ts', './PlayerController.ts', './PlayerHealth.ts', './WorldScroll.ts', './RoomManager.ts', './ChargeBar.ts', './ComboHud.ts', './DebugOverlay.ts', './DebugOverlayLoader.ts', './GameOver.ts', './HeartHud.ts', './HitboxDebug.ts', './HudFrame.ts', './LevelHud.ts', './ScoreHud.ts', './TouchControls.ts', './TouchPad.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/PlayerController.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './FixedStepDriver.ts', './InputState.ts', './TuningConfig.ts', './LevelData.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Sprite, find, assetManager, SpriteFrame, UITransform, Component, AudioManager, FixedStepDriver, inputState, initTuning, getTuning, SPAWN_POS, ROOM_BASE_Y, ROOM_ROWS, LEVEL_TILE_PX, THIN_PLATFORM_SPECS, solidAtWorld;
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
      AudioManager = module.AudioManager;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      inputState = module.inputState;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      SPAWN_POS = module.SPAWN_POS;
      ROOM_BASE_Y = module.ROOM_BASE_Y;
      ROOM_ROWS = module.ROOM_ROWS;
      LEVEL_TILE_PX = module.LEVEL_TILE_PX;
      THIN_PLATFORM_SPECS = module.THIN_PLATFORM_SPECS;
      solidAtWorld = module.solidAtWorld;
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
          _this._jumpStepsLeft = 0;
          _this._stepBound = false;
          _this._sprite = null;
          _this._framesIdle = [];
          _this._framesRun = [];
          _this._framesSpin = [];
          _this._framesAir = [];
          _this._framesShoot = [];
          _this._spritesReady = false;
          _this._animState = 'idle';
          _this._animIndex = 0;
          _this._animStep = 0;
          _this._spinDone = false;
          _this.firingHeld = false;
          _this.controlsLocked = false;
          _this._knockbackSteps = 0;
          _this._audio = null;
          return _this;
        }
        var _proto = PlayerController.prototype;
        _proto.onLoad = function onLoad() {
          var _find$getComponent, _find;
          void initTuning();
          this._x = SPAWN_POS.x;
          this._y = SPAWN_POS.y;
          this._applyBodySize();
          this.node.setPosition(this._x, this._y);
          this._sprite = this.getComponent(Sprite);
          this._loadPlayerSprites();
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
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
          var hitW = player.hitboxWidth;
          var hitH = player.hitboxHeight;
          var halfW = hitW / 2;
          var halfH = hitH / 2;
          var hitOffY = player.hitboxOffsetY;
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
            var _g = tuning.gunboots;
            fallCap = _g.recoilMode === 'cap' ? player.terminalFallSpeed * _g.fallSpeedFactorWhileFiring : player.terminalFallSpeed;
          }
          if (this._vy < -fallCap) {
            this._vy = -fallCap;
          }
          var g = tuning.gunboots;
          // 悬浮模式：开火期间把下落速度钳到 hangFallSpeed（0 = 完全定住）
          if (g.recoilMode === 'hang' && this.firingHeld && !this._onGround) {
            var target = -Math.max(0, g.hangFallSpeed);
            var damp = Math.max(1, g.hangDampingSteps);
            var step = (this._vy - target) / damp;
            this._vy -= step;
            // 逼近后消除残差，避免无限逼近留下 0.001 级抖动
            if (Math.abs(this._vy - target) < 0.02) {
              this._vy = target;
            }
          }
          if (!this.controlsLocked && inputState.jumpPressed && this._onGround) {
            var _this$_audio;
            this._vy = player.jumpInitialSpeed;
            this._onGround = false;
            this._jumpStepsLeft = player.minJumpSteps;
            this._startSpinAnim();
            (_this$_audio = this._audio) == null || _this$_audio.play('jump');
          }
          if (!this.controlsLocked && !inputState.jumpHeld && this._vy > 0 && player.jumpReleaseMode === 'cut' && this._jumpStepsLeft <= 0) {
            this._vy = 0;
          }
          if (this._jumpStepsLeft > 0) {
            this._jumpStepsLeft -= 1;
          }
          var moveX = this._vx;
          this._x += moveX;
          this._separateAxis(tileSize, halfW, halfH, hitOffY, true, moveX, 0);
          var moveY = this._vy;
          this._y += moveY;
          this._onGround = false;
          this._separateAxis(tileSize, halfW, halfH, hitOffY, false, 0, moveY);
          if (this._y < ROOM_BASE_Y - 20 * ROOM_ROWS * LEVEL_TILE_PX) {
            this._x = SPAWN_POS.x;
            this._y = SPAWN_POS.y;
            this._vx = 0;
            this._vy = 0;
          }
          if (!this._onGround && moveY <= 0) {
            var newBottom = this._y + hitOffY - halfH;
            var prevBottom = newBottom - moveY;
            var left = this._x - halfW;
            var right = this._x + halfW;
            for (var i = 0; i < THIN_PLATFORM_SPECS.length; i += 1) {
              var t = THIN_PLATFORM_SPECS[i];
              var pLeft = t.col0 * LEVEL_TILE_PX;
              var pRight = (t.col0 + t.len) * LEVEL_TILE_PX;
              if (right <= pLeft || left >= pRight) {
                continue;
              }
              var surface = -t.row * LEVEL_TILE_PX;
              if (prevBottom >= surface - EPS && newBottom <= surface) {
                this._y = surface + halfH - hitOffY;
                this._vy = 0;
                this._onGround = true;
                break;
              }
            }
          }
          this.node.setPosition(this._x, this._y);
          this._updatePlayerAnim();
          inputState.consumeEdges();
        };
        _proto._loadPlayerSprites = function _loadPlayerSprites() {
          var _this3 = this;
          assetManager.loadBundle('mainui', function (bundleErr, bundle) {
            if (bundleErr || !bundle) {
              console.error('[PlayerController] loadBundle failed bundle=mainui', bundleErr);
              return;
            }
            bundle.loadDir('sprite/player', SpriteFrame, function (err, assets) {
              if (err || !assets) {
                console.error('[PlayerController] loadDir failed path=sprite/player', err);
                return;
              }
              var byPrefix = function byPrefix(prefix) {
                return assets.filter(function (a) {
                  return a.name.startsWith(prefix);
                }).sort(function (a, b) {
                  return a.name.localeCompare(b.name);
                });
              };
              _this3._framesIdle = byPrefix('idle_');
              _this3._framesRun = byPrefix('run_');
              _this3._framesSpin = byPrefix('spin_');
              _this3._framesAir = byPrefix('air_');
              _this3._framesShoot = byPrefix('shoot_');
              _this3._spritesReady = true;
              _this3._applyGroundSprite(_this3._onGround);
            });
          });
        };
        _proto._updatePlayerAnim = function _updatePlayerAnim() {
          if (!this._spritesReady) {
            return;
          }
          var firingAir = this.firingHeld && !this._onGround;
          if (this._onGround) {
            var wantMove = inputState.left || inputState.right;
            var moving = wantMove && Math.abs(this._vx) > 0.05;
            this._setAnimState(moving ? 'run' : 'idle');
          } else if (firingAir) {
            this._setAnimState('shoot');
          } else if (this._animState === 'spin') {
            if (this._spinDone) {
              this._setAnimState('air');
            }
          } else if (this._animState === 'shoot') {
            this._setAnimState('air');
          } else if (this._animState === 'idle' || this._animState === 'run') {
            this._setAnimState('air');
          }
          this._advanceAnimFrame();
          this._applyAnimFrame();
        }

        /** 兼容旧调用：落地 idle / 空中 air，由状态机多帧播放。 */;
        _proto._applyGroundSprite = function _applyGroundSprite(onGround) {
          if (!this._spritesReady) {
            return;
          }
          this._setAnimState(onGround ? 'idle' : 'air');
          this._applyAnimFrame();
        };
        _proto._startSpinAnim = function _startSpinAnim() {
          this._setAnimState('spin');
        };
        _proto._setAnimState = function _setAnimState(next) {
          if (this._animState === next) {
            return;
          }
          this._animState = next;
          this._animIndex = 0;
          this._animStep = 0;
          this._spinDone = next !== 'spin';
        };
        _proto._framesForState = function _framesForState(state) {
          switch (state) {
            case 'idle':
              return this._framesIdle;
            case 'run':
              return this._framesRun;
            case 'spin':
              return this._framesSpin;
            case 'air':
              return this._framesAir;
            case 'shoot':
              return this._framesShoot;
            default:
              return this._framesIdle;
          }
        };
        _proto._stepsPerFrameForState = function _stepsPerFrameForState(state) {
          var anim = getTuning().player.anim;
          switch (state) {
            case 'idle':
              return anim.idleStepsPerFrame;
            case 'run':
              return anim.runStepsPerFrame;
            case 'spin':
              return anim.spinStepsPerFrame;
            case 'air':
              return anim.airStepsPerFrame;
            case 'shoot':
              return anim.shootStepsPerFrame;
            default:
              return anim.idleStepsPerFrame;
          }
        };
        _proto._advanceAnimFrame = function _advanceAnimFrame() {
          var frames = this._framesForState(this._animState);
          if (frames.length === 0) {
            return;
          }
          this._animStep += 1;
          var spf = Math.max(1, this._stepsPerFrameForState(this._animState));
          if (this._animStep < spf) {
            return;
          }
          this._animStep = 0;
          var nextIndex = this._animIndex + 1;
          if (this._animState === 'spin') {
            if (nextIndex >= frames.length) {
              this._animIndex = frames.length - 1;
              this._spinDone = true;
            } else {
              this._animIndex = nextIndex;
            }
            return;
          }
          this._animIndex = nextIndex >= frames.length ? 0 : nextIndex;
        };
        _proto._applyAnimFrame = function _applyAnimFrame() {
          if (!this._sprite) {
            return;
          }
          var frames = this._framesForState(this._animState);
          if (frames.length === 0) {
            return;
          }
          var idx = Math.min(this._animIndex, frames.length - 1);
          this._sprite.spriteFrame = frames[idx];
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
        _proto._separateAxis = function _separateAxis(tileSize, halfW, halfH, hitOffY, horizontal, moveX, moveY) {
          var cell = tileSize;
          var left = this._x - halfW;
          var right = this._x + halfW;
          var bottom = this._y + hitOffY - halfH;
          var top = this._y + hitOffY + halfH;
          var col0 = Math.floor(left / cell);
          var col1 = Math.floor((right - EPS) / cell);
          var row0 = Math.floor(-top / cell);
          var row1 = Math.floor((-bottom - EPS) / cell);
          var hit = false;
          for (var row = row0; row <= row1; row++) {
            for (var col = col0; col <= col1; col++) {
              var cx = col * cell + cell / 2;
              var cy = -row * cell - cell / 2;
              if (!solidAtWorld(cx, cy)) {
                continue;
              }
              var tileLeft = col * cell;
              var tileRight = (col + 1) * cell;
              var tileTop = -row * cell;
              var tileBottom = -(row + 1) * cell;
              if (horizontal) {
                if (moveX > 0) {
                  this._x = Math.min(this._x, tileLeft - halfW);
                  hit = true;
                } else if (moveX < 0) {
                  this._x = Math.max(this._x, tileRight + halfW);
                  hit = true;
                }
              } else if (moveY < 0) {
                this._y = Math.max(this._y, tileTop + halfH - hitOffY);
                this._onGround = true;
                hit = true;
              } else if (moveY > 0) {
                this._y = Math.min(this._y, tileBottom - halfH - hitOffY);
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
          if (g.recoilMode === 'hang') {
            // 悬浮模式：不施加任何向上冲量，垂直速度由 _applyHang 每步钳制
            return;
          }
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
        }

        /** 踩踏弹起：DW-03 的 scrEnemyStomped 之后的回弹 */;
        _proto.bounceFromStomp = function bounceFromStomp() {
          this._vy = getTuning().stomp.bounceVy;
          this._onGround = false;
        };
        _proto.getHitbox = function getHitbox() {
          var p = getTuning().player;
          return {
            x: this._x,
            y: this._y + p.hitboxOffsetY,
            w: p.hitboxWidth,
            h: p.hitboxHeight
          };
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

System.register("chunks:///_virtual/PlayerHealth.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './AudioManager.ts', './FixedStepDriver.ts', './TuningConfig.ts', './PlayerController.ts', './ComboTracker.ts', './GameOver.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, Sprite, find, Component, AudioManager, FixedStepDriver, initTuning, getTuning, PlayerController, ComboTracker, GameOver;
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
      AudioManager = module.AudioManager;
    }, function (module) {
      FixedStepDriver = module.FixedStepDriver;
    }, function (module) {
      initTuning = module.initTuning;
      getTuning = module.getTuning;
    }, function (module) {
      PlayerController = module.PlayerController;
    }, function (module) {
      ComboTracker = module.ComboTracker;
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
          _this._audio = null;
          _this._combo = null;
          return _this;
        }
        var _proto = PlayerHealth.prototype;
        _proto.onLoad = function onLoad() {
          var _find$getComponent, _find, _find$getComponent2, _find2;
          void initTuning();
          this._hp = this.maxHp;
          this.invulnLeft = 0;
          this._sprite = this.getComponent(Sprite);
          this._audio = (_find$getComponent = (_find = find('Game')) == null ? void 0 : _find.getComponent(AudioManager)) != null ? _find$getComponent : null;
          this._combo = (_find$getComponent2 = (_find2 = find('Game')) == null ? void 0 : _find2.getComponent(ComboTracker)) != null ? _find$getComponent2 : null;
          if (typeof window !== 'undefined') {
            window.__dwHealth = this;
          }
        };
        _proto.onEnable = function onEnable() {
          this._bindStep();
        };
        _proto.takeDamage = function takeDamage(n, fromX) {
          var _this$_audio, _this$_combo, _find3;
          if (this.invulnLeft > 0 || this.isDead) {
            return false;
          }
          this._hp -= n;
          (_this$_audio = this._audio) == null || _this$_audio.play('player_hit');
          (_this$_combo = this._combo) == null || _this$_combo.onPlayerHurt();
          this.invulnLeft = getTuning().health.invulnSteps;
          var ctrl = (_find3 = find('World/Player')) == null ? void 0 : _find3.getComponent(PlayerController);
          ctrl == null || ctrl.applyHurtKnockback(fromX);
          if (this._hp <= 0) {
            var _this$_audio2, _find4;
            this._dead = true;
            (_this$_audio2 = this._audio) == null || _this$_audio2.play('death');
            console.log('[PlayerHealth] dead hp=' + this._hp);
            if (ctrl) {
              ctrl.controlsLocked = true;
            }
            (_find4 = find('Canvas/GameOver')) == null || (_find4 = _find4.getComponent(GameOver)) == null || _find4.show();
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

System.register("chunks:///_virtual/RoomManager.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './LevelData.ts', './PlayerController.ts'], function (exports) {
  var _inheritsLoose, _createClass, cclegacy, _decorator, find, Component, FixedStepDriver, SIDE_PORTS, ROOM_EXITS, ROOM_INSTANCES, LEVEL_TILE_PX, PlayerController;
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
      SIDE_PORTS = module.SIDE_PORTS;
      ROOM_EXITS = module.ROOM_EXITS;
      ROOM_INSTANCES = module.ROOM_INSTANCES;
      LEVEL_TILE_PX = module.LEVEL_TILE_PX;
    }, function (module) {
      PlayerController = module.PlayerController;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "a7e3ckfLYRLbp8ajF0OS3pi", "RoomManager", undefined);
      var ccclass = _decorator.ccclass;
      var RoomManager = exports('RoomManager', (_dec = ccclass('RoomManager'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(RoomManager, _Component);
        function RoomManager() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._player = null;
          _this._inRoom = false;
          _this._currentRoom = -1;
          _this._returnPos = {
            x: 0,
            y: 0
          };
          _this._stepBound = false;
          /** 出房后必须完全离开所有侧门 AABB，才允许再次进房（防止出门即回吸） */
          _this._portalArmed = true;
          return _this;
        }
        var _proto = RoomManager.prototype;
        _proto.onLoad = function onLoad() {
          this._bindStep();
        };
        _proto.start = function start() {
          var _find$getComponent, _find;
          this._player = (_find$getComponent = (_find = find('World/Player')) == null ? void 0 : _find.getComponent(PlayerController)) != null ? _find$getComponent : null;
          if (!this._player) {
            console.error('[RoomManager] PlayerController not found at World/Player');
          }
          for (var i = 0; i < SIDE_PORTS.length; i += 1) {
            if (SIDE_PORTS[i].roomIndex !== i) {
              console.error("[RoomManager] SIDE_PORTS[" + i + "].roomIndex=" + SIDE_PORTS[i].roomIndex + " != " + i);
            }
          }
          console.log("[RoomManager] ports=" + SIDE_PORTS.length + " exits=" + ROOM_EXITS.length + " armed latch=on");
          window.__dwRoom = this;
        };
        _proto._bindStep = function _bindStep() {
          var _this2 = this;
          if (this._stepBound) {
            return;
          }
          var gameNode = find('Game');
          var driver = gameNode ? gameNode.getComponent(FixedStepDriver) : null;
          if (!driver) {
            console.error('[RoomManager] FixedStepDriver not found on Game');
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
          if (!this._player) {
            return;
          }
          var pc = this._player;
          var hb = this._player.getHitbox();
          var halfW = hb.w / 2;
          var halfH = hb.h / 2;
          var left = hb.x - halfW;
          var right = hb.x + halfW;
          var bottom = hb.y - halfH;
          var top = hb.y + halfH;
          if (!this._inRoom) {
            var overlappingAny = false;
            for (var i = 0; i < SIDE_PORTS.length; i += 1) {
              if (this._aabbOverlapsTile(left, right, bottom, top, SIDE_PORTS[i])) {
                overlappingAny = true;
                break;
              }
            }
            if (!overlappingAny) {
              this._portalArmed = true;
            }
            if (!this._portalArmed) {
              return;
            }
            for (var _i = 0; _i < SIDE_PORTS.length; _i += 1) {
              var port = SIDE_PORTS[_i];
              if (this._aabbOverlapsTile(left, right, bottom, top, port)) {
                this._enterRoom(port, pc);
                return;
              }
            }
            return;
          }
          var room = ROOM_INSTANCES[this._currentRoom];
          if (room && pc._y > room.originY) {
            this._leaveRoom(pc);
            return;
          }
          if (this._inRoom) {
            for (var _i2 = 0; _i2 < ROOM_EXITS.length; _i2 += 1) {
              var exit = ROOM_EXITS[_i2];
              if (exit.roomIndex !== this._currentRoom) {
                continue;
              }
              var exitRoom = ROOM_INSTANCES[exit.roomIndex];
              if (!exitRoom) {
                continue;
              }
              var tileLeft = exit.col * LEVEL_TILE_PX;
              var tileRight = tileLeft + LEVEL_TILE_PX;
              var tileTop = exitRoom.originY - exit.row * LEVEL_TILE_PX;
              var tileBottom = tileTop - LEVEL_TILE_PX;
              if (left < tileRight && right > tileLeft && bottom < tileTop && top > tileBottom) {
                this._leaveRoom(pc);
                return;
              }
            }
          }
        };
        _proto._leaveRoom = function _leaveRoom(pc) {
          var port = SIDE_PORTS[this._currentRoom];
          var pushIn = port && port.col <= 1 ? LEVEL_TILE_PX : -LEVEL_TILE_PX;
          var returnX = this._returnPos.x + pushIn;
          var returnY = this._returnPos.y + 20;
          pc._x = returnX;
          pc._y = returnY;
          pc._vx = 0;
          pc._vy = 0;
          this._player.node.setPosition(returnX, returnY);
          this._inRoom = false;
          this._currentRoom = -1;
          this._portalArmed = false;
        };
        _proto._aabbOverlapsTile = function _aabbOverlapsTile(left, right, bottom, top, port) {
          var tileLeft = port.col * LEVEL_TILE_PX;
          var tileRight = tileLeft + LEVEL_TILE_PX;
          var tileTop = -port.row * LEVEL_TILE_PX;
          var tileBottom = tileTop - LEVEL_TILE_PX;
          return left < tileRight && right > tileLeft && bottom < tileTop && top > tileBottom;
        };
        _proto._enterRoom = function _enterRoom(port, pc) {
          var room = ROOM_INSTANCES[port.roomIndex];
          if (!room) {
            return;
          }
          this._returnPos.x = pc._x;
          this._returnPos.y = pc._y;
          var destX = 4.5 * LEVEL_TILE_PX;
          var destY = room.originY - 15 * LEVEL_TILE_PX;
          pc._x = destX;
          pc._y = destY;
          pc._vx = 0;
          pc._vy = 0;
          this._player.node.setPosition(destX, destY);
          this._inRoom = true;
          this._currentRoom = port.roomIndex;
          this._portalArmed = true;
        };
        _createClass(RoomManager, [{
          key: "inRoom",
          get: function get() {
            return this._inRoom;
          }
        }, {
          key: "currentRoomIndex",
          get: function get() {
            return this._currentRoom;
          }
        }]);
        return RoomManager;
      }(Component)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RunState.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "140a759w/JN5LZ1Nwr9vP38", "RunState", undefined);
      /**
       * 一局内的跨关卡状态。模块级变量，director.loadScene('Main') 不会重置（同一 JS 上下文）。
       */
      var RunStateImpl = /*#__PURE__*/function () {
        function RunStateImpl() {
          this.level = 1;
          this.score = 0;
        }
        var _proto = RunStateImpl.prototype;
        _proto.reset = function reset() {
          this.level = 1;
          this.score = 0;
        };
        return RunStateImpl;
      }();
      var runState = exports('runState', new RunStateImpl());

      // 调试钩子（Hermes CDP 复验用）
      window.__dwRunState = runState;
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ScoreHud.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './GemManager.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, Label, find, Component, GemManager;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Label = module.Label;
      find = module.find;
      Component = module.Component;
    }, function (module) {
      GemManager = module.GemManager;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "e8b72LmGFpJk6RT8CNHkC3C", "ScoreHud", undefined);
      var ccclass = _decorator.ccclass;
      var ScoreHud = exports('ScoreHud', (_dec = ccclass('ScoreHud'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(ScoreHud, _Component);
        function ScoreHud() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this._label = null;
          _this._lastScore = -1;
          return _this;
        }
        var _proto = ScoreHud.prototype;
        _proto.onLoad = function onLoad() {
          this._label = this.getComponent(Label);
          if (typeof window !== 'undefined') {
            window.__dwScoreHud = this;
          }
        };
        _proto.update = function update() {
          var _find$getComponent$sc, _find;
          var score = (_find$getComponent$sc = (_find = find('Game')) == null || (_find = _find.getComponent(GemManager)) == null ? void 0 : _find.score) != null ? _find$getComponent$sc : 0;
          if (score === this._lastScore || !this._label) {
            return;
          }
          this._lastScore = score;
          this._label.string = "GEMS " + score;
        };
        return ScoreHud;
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
        buttons: ['left']
      }, {
        path: 'BtnRight',
        buttons: ['right']
      }, {
        path: 'BtnAction',
        buttons: ['jump', 'fire']
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
          var drawn = new Set();
          for (var _i = 0, _BUTTON_MAP = BUTTON_MAP; _i < _BUTTON_MAP.length; _i++) {
            var _BUTTON_MAP$_i = _BUTTON_MAP[_i],
              path = _BUTTON_MAP$_i.path,
              buttons = _BUTTON_MAP$_i.buttons;
            var node = this.node.getChildByPath(path);
            if (!node) {
              console.error("[TouchControls] missing child path=" + path);
              continue;
            }
            for (var _iterator = _createForOfIteratorHelperLoose(buttons), _step; !(_step = _iterator()).done;) {
              var button = _step.value;
              this._buttonNodes.set(button, node);
            }
            if (!drawn.has(node)) {
              drawn.add(node);
              this._drawButtonGraphics(node);
            }
          }
        };
        _proto.onDisable = function onDisable() {
          var released = new Set();
          for (var _iterator2 = _createForOfIteratorHelperLoose(this._buttonNodes), _step2; !(_step2 = _iterator2()).done;) {
            var _step2$value = _step2.value,
              button = _step2$value[0],
              node = _step2$value[1];
            if (released.has(node)) {
              continue;
            }
            released.add(node);
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
  var _inheritsLoose, _createForOfIteratorHelperLoose, cclegacy, _decorator, find, UITransform, Vec3, Component, getTuning, inputState, TouchControls;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      find = module.find;
      UITransform = module.UITransform;
      Vec3 = module.Vec3;
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
        name: 'BtnAction',
        button: 'action'
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
          _this._actionNode = null;
          _this._actionNormalScale = new Vec3(1, 1, 1);
          _this._actionPressedScale = new Vec3(0.9, 0.9, 1);
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
          this._actionNode = find('Canvas/TouchControls/BtnAction');
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
          if (btn === 'action') {
            inputState.setTouch('jump', down);
            inputState.setTouch('fire', down);
            this._setActionVisual(down);
            return;
          }
          inputState.setTouch(btn, down);
          (_find = find('Canvas/TouchControls')) == null || (_find = _find.getComponent(TouchControls)) == null || _find.setPressed(btn, down);
        };
        _proto._setActionVisual = function _setActionVisual(down) {
          var _this$_actionNode;
          var node = (_this$_actionNode = this._actionNode) != null ? _this$_actionNode : find('Canvas/TouchControls/BtnAction');
          if (!node) {
            return;
          }
          node.setScale(down ? this._actionPressedScale : this._actionNormalScale);
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
      var TUNING_URL = 'tuning.json?v=' + Date.now();
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
          hitboxWidth: 12,
          hitboxHeight: 16,
          hitboxOffsetY: -3,
          terminalFallSpeed: 4.7333,
          gravity: 0.4,
          horizontalSpeed: 1.2,
          accelSteps: 3,
          jumpInitialSpeed: 6.2,
          minJumpSteps: 6,
          jumpReleaseMode: 'cut',
          anim: {
            idleStepsPerFrame: 12,
            airStepsPerFrame: 8,
            shootStepsPerFrame: 5,
            spinStepsPerFrame: 4,
            runStepsPerFrame: 4
          }
        },
        level: {
          tileSize: 16,
          wellWidthTiles: 10,
          wallThicknessTiles: 2,
          cullMarginPx: 320
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
          recoilMode: 'hang',
          fallSpeedFactorWhileFiring: 0.45,
          recoilPop: 0,
          recoilMaxRise: 6.0,
          recoilImpulse: 0,
          hangFallSpeed: 0,
          hangDampingSteps: 2
        },
        health: {
          maxHp: 4,
          invulnSteps: 36,
          knockbackVx: 1.6,
          knockbackVy: 2.2,
          deathRestartDelaySteps: 30
        },
        gems: {
          smallScore: 1,
          mediumScore: 3,
          gravity: 0.3,
          popUpSpeed: 2.2,
          bounceFactor: 0.45,
          maxBounces: 2,
          lifeSteps: 180,
          blinkSteps: 60,
          chargePerGem: 1
        },
        stomp: {
          bounceVy: 3.2,
          toleranceY: 6
        },
        combo: {
          windowSteps: 90,
          minForTip: 3,
          rewardEvery: 5,
          rewardKind: 'medium'
        },
        enemyHitbox: {
          snailWidth: 18,
          snailHeight: 24,
          snailOffsetY: 0,
          batWidth: 15,
          batHeight: 12,
          batOffsetY: 2
        },
        crumble: {
          hp: 3,
          flashSteps: 4,
          animStepsPerFrame: 3
        },
        room: {
          portalAnimStepsPerFrame: 4
        },
        gemChunk: {
          hp: 3,
          gemsPerChunk: 4,
          idleStepsPerFrame: 8,
          breakStepsPerFrame: 3
        },
        flow: {
          fadeSteps: 14,
          triggerDepth: 4
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
            hitboxWidth: tuning.player.hitboxWidth,
            hitboxHeight: tuning.player.hitboxHeight,
            hitboxOffsetY: tuning.player.hitboxOffsetY,
            terminalFallSpeed: tuning.player.terminalFallSpeed,
            gravity: tuning.player.gravity,
            horizontalSpeed: tuning.player.horizontalSpeed,
            accelSteps: tuning.player.accelSteps,
            jumpInitialSpeed: tuning.player.jumpInitialSpeed,
            minJumpSteps: tuning.player.minJumpSteps,
            jumpReleaseMode: tuning.player.jumpReleaseMode,
            anim: {
              idleStepsPerFrame: tuning.player.anim.idleStepsPerFrame,
              airStepsPerFrame: tuning.player.anim.airStepsPerFrame,
              shootStepsPerFrame: tuning.player.anim.shootStepsPerFrame,
              spinStepsPerFrame: tuning.player.anim.spinStepsPerFrame,
              runStepsPerFrame: tuning.player.anim.runStepsPerFrame
            }
          },
          level: {
            tileSize: tuning.level.tileSize,
            wellWidthTiles: tuning.level.wellWidthTiles,
            wallThicknessTiles: tuning.level.wallThicknessTiles,
            cullMarginPx: tuning.level.cullMarginPx
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
            recoilImpulse: tuning.gunboots.recoilImpulse,
            hangFallSpeed: tuning.gunboots.hangFallSpeed,
            hangDampingSteps: tuning.gunboots.hangDampingSteps
          },
          health: {
            maxHp: tuning.health.maxHp,
            invulnSteps: tuning.health.invulnSteps,
            knockbackVx: tuning.health.knockbackVx,
            knockbackVy: tuning.health.knockbackVy,
            deathRestartDelaySteps: tuning.health.deathRestartDelaySteps
          },
          gems: {
            smallScore: tuning.gems.smallScore,
            mediumScore: tuning.gems.mediumScore,
            gravity: tuning.gems.gravity,
            popUpSpeed: tuning.gems.popUpSpeed,
            bounceFactor: tuning.gems.bounceFactor,
            maxBounces: tuning.gems.maxBounces,
            lifeSteps: tuning.gems.lifeSteps,
            blinkSteps: tuning.gems.blinkSteps,
            chargePerGem: tuning.gems.chargePerGem
          },
          stomp: {
            bounceVy: tuning.stomp.bounceVy,
            toleranceY: tuning.stomp.toleranceY
          },
          combo: {
            windowSteps: tuning.combo.windowSteps,
            minForTip: tuning.combo.minForTip,
            rewardEvery: tuning.combo.rewardEvery,
            rewardKind: tuning.combo.rewardKind
          },
          enemyHitbox: {
            snailWidth: tuning.enemyHitbox.snailWidth,
            snailHeight: tuning.enemyHitbox.snailHeight,
            snailOffsetY: tuning.enemyHitbox.snailOffsetY,
            batWidth: tuning.enemyHitbox.batWidth,
            batHeight: tuning.enemyHitbox.batHeight,
            batOffsetY: tuning.enemyHitbox.batOffsetY
          },
          crumble: {
            hp: tuning.crumble.hp,
            flashSteps: tuning.crumble.flashSteps,
            animStepsPerFrame: tuning.crumble.animStepsPerFrame
          },
          room: {
            portalAnimStepsPerFrame: tuning.room.portalAnimStepsPerFrame
          },
          gemChunk: {
            hp: tuning.gemChunk.hp,
            gemsPerChunk: tuning.gemChunk.gemsPerChunk,
            idleStepsPerFrame: tuning.gemChunk.idleStepsPerFrame,
            breakStepsPerFrame: tuning.gemChunk.breakStepsPerFrame
          },
          flow: {
            fadeSteps: tuning.flow.fadeSteps,
            triggerDepth: tuning.flow.triggerDepth
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
        var playerAnimRaw = isRecord(raw.player.anim) ? raw.player.anim : null;
        if (!playerAnimRaw) {
          throw new Error('missing player.anim');
        }
        if (!isRecord(raw.level)) {
          throw new Error('missing level');
        }
        if (!isRecord(raw.gunboots)) {
          throw new Error('missing gunboots');
        }
        var healthRaw = isRecord(raw.health) ? raw.health : null;
        var gemsRaw = isRecord(raw.gems) ? raw.gems : null;
        var stompRaw = isRecord(raw.stomp) ? raw.stomp : null;
        var comboRaw = isRecord(raw.combo) ? raw.combo : null;
        var enemyHitboxRaw = isRecord(raw.enemyHitbox) ? raw.enemyHitbox : null;
        var crumbleRaw = isRecord(raw.crumble) ? raw.crumble : null;
        var roomRaw = isRecord(raw.room) ? raw.room : null;
        var gemChunkRaw = isRecord(raw.gemChunk) ? raw.gemChunk : null;
        var flowRaw = isRecord(raw.flow) ? raw.flow : null;
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
            hitboxWidth: readNumberValue(raw.player.hitboxWidth, 'player.hitboxWidth'),
            hitboxHeight: readNumberValue(raw.player.hitboxHeight, 'player.hitboxHeight'),
            hitboxOffsetY: readNumberValue(raw.player.hitboxOffsetY, 'player.hitboxOffsetY'),
            terminalFallSpeed: readNumberValue(raw.player.terminalFallSpeed, 'player.terminalFallSpeed'),
            gravity: readNumberValue(raw.player.gravity, 'player.gravity'),
            horizontalSpeed: readNumberValue(raw.player.horizontalSpeed, 'player.horizontalSpeed'),
            accelSteps: readNumberValue(raw.player.accelSteps, 'player.accelSteps'),
            jumpInitialSpeed: readNumberValue(raw.player.jumpInitialSpeed, 'player.jumpInitialSpeed'),
            minJumpSteps: readNumberValue(raw.player.minJumpSteps, 'player.minJumpSteps'),
            jumpReleaseMode: readStringValue(raw.player.jumpReleaseMode, 'player.jumpReleaseMode'),
            anim: {
              idleStepsPerFrame: readNumberValue(playerAnimRaw.idleStepsPerFrame, 'player.anim.idleStepsPerFrame'),
              airStepsPerFrame: readNumberValue(playerAnimRaw.airStepsPerFrame, 'player.anim.airStepsPerFrame'),
              shootStepsPerFrame: readNumberValue(playerAnimRaw.shootStepsPerFrame, 'player.anim.shootStepsPerFrame'),
              spinStepsPerFrame: readNumberValue(playerAnimRaw.spinStepsPerFrame, 'player.anim.spinStepsPerFrame'),
              runStepsPerFrame: readNumberValue(playerAnimRaw.runStepsPerFrame, 'player.anim.runStepsPerFrame')
            }
          },
          level: {
            tileSize: readNumberValue(raw.level.tileSize, 'level.tileSize'),
            wellWidthTiles: readNumberValue(raw.level.wellWidthTiles, 'level.wellWidthTiles'),
            wallThicknessTiles: readNumberValue(raw.level.wallThicknessTiles, 'level.wallThicknessTiles'),
            cullMarginPx: readNumberValue(raw.level.cullMarginPx, 'level.cullMarginPx')
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
            recoilImpulse: readNumberValue(raw.gunboots.recoilImpulse, 'gunboots.recoilImpulse'),
            hangFallSpeed: readNumberValue(raw.gunboots.hangFallSpeed, 'gunboots.hangFallSpeed'),
            hangDampingSteps: readNumberValue(raw.gunboots.hangDampingSteps, 'gunboots.hangDampingSteps')
          },
          health: {
            maxHp: healthRaw ? readNumberValue(healthRaw.maxHp, 'health.maxHp') : DEFAULT_TUNING.health.maxHp,
            invulnSteps: healthRaw ? readNumberValue(healthRaw.invulnSteps, 'health.invulnSteps') : DEFAULT_TUNING.health.invulnSteps,
            knockbackVx: healthRaw ? readNumberValue(healthRaw.knockbackVx, 'health.knockbackVx') : DEFAULT_TUNING.health.knockbackVx,
            knockbackVy: healthRaw ? readNumberValue(healthRaw.knockbackVy, 'health.knockbackVy') : DEFAULT_TUNING.health.knockbackVy,
            deathRestartDelaySteps: healthRaw ? readNumberValue(healthRaw.deathRestartDelaySteps, 'health.deathRestartDelaySteps') : DEFAULT_TUNING.health.deathRestartDelaySteps
          },
          gems: {
            smallScore: gemsRaw ? readNumberValue(gemsRaw.smallScore, 'gems.smallScore') : DEFAULT_TUNING.gems.smallScore,
            mediumScore: gemsRaw ? readNumberValue(gemsRaw.mediumScore, 'gems.mediumScore') : DEFAULT_TUNING.gems.mediumScore,
            gravity: gemsRaw ? readNumberValue(gemsRaw.gravity, 'gems.gravity') : DEFAULT_TUNING.gems.gravity,
            popUpSpeed: gemsRaw ? readNumberValue(gemsRaw.popUpSpeed, 'gems.popUpSpeed') : DEFAULT_TUNING.gems.popUpSpeed,
            bounceFactor: gemsRaw ? readNumberValue(gemsRaw.bounceFactor, 'gems.bounceFactor') : DEFAULT_TUNING.gems.bounceFactor,
            maxBounces: gemsRaw ? readNumberValue(gemsRaw.maxBounces, 'gems.maxBounces') : DEFAULT_TUNING.gems.maxBounces,
            lifeSteps: gemsRaw ? readNumberValue(gemsRaw.lifeSteps, 'gems.lifeSteps') : DEFAULT_TUNING.gems.lifeSteps,
            blinkSteps: gemsRaw ? readNumberValue(gemsRaw.blinkSteps, 'gems.blinkSteps') : DEFAULT_TUNING.gems.blinkSteps,
            chargePerGem: gemsRaw ? readNumberValue(gemsRaw.chargePerGem, 'gems.chargePerGem') : DEFAULT_TUNING.gems.chargePerGem
          },
          stomp: {
            bounceVy: stompRaw ? readNumberValue(stompRaw.bounceVy, 'stomp.bounceVy') : DEFAULT_TUNING.stomp.bounceVy,
            toleranceY: stompRaw ? readNumberValue(stompRaw.toleranceY, 'stomp.toleranceY') : DEFAULT_TUNING.stomp.toleranceY
          },
          combo: {
            windowSteps: comboRaw ? readNumberValue(comboRaw.windowSteps, 'combo.windowSteps') : DEFAULT_TUNING.combo.windowSteps,
            minForTip: comboRaw ? readNumberValue(comboRaw.minForTip, 'combo.minForTip') : DEFAULT_TUNING.combo.minForTip,
            rewardEvery: comboRaw ? readNumberValue(comboRaw.rewardEvery, 'combo.rewardEvery') : DEFAULT_TUNING.combo.rewardEvery,
            rewardKind: comboRaw ? readComboRewardKind(comboRaw) : DEFAULT_TUNING.combo.rewardKind
          },
          enemyHitbox: {
            snailWidth: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.snailWidth, 'enemyHitbox.snailWidth') : DEFAULT_TUNING.enemyHitbox.snailWidth,
            snailHeight: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.snailHeight, 'enemyHitbox.snailHeight') : DEFAULT_TUNING.enemyHitbox.snailHeight,
            snailOffsetY: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.snailOffsetY, 'enemyHitbox.snailOffsetY') : DEFAULT_TUNING.enemyHitbox.snailOffsetY,
            batWidth: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.batWidth, 'enemyHitbox.batWidth') : DEFAULT_TUNING.enemyHitbox.batWidth,
            batHeight: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.batHeight, 'enemyHitbox.batHeight') : DEFAULT_TUNING.enemyHitbox.batHeight,
            batOffsetY: enemyHitboxRaw ? readNumberValue(enemyHitboxRaw.batOffsetY, 'enemyHitbox.batOffsetY') : DEFAULT_TUNING.enemyHitbox.batOffsetY
          },
          crumble: {
            hp: crumbleRaw ? readNumberValue(crumbleRaw.hp, 'crumble.hp') : DEFAULT_TUNING.crumble.hp,
            flashSteps: crumbleRaw ? readNumberValue(crumbleRaw.flashSteps, 'crumble.flashSteps') : DEFAULT_TUNING.crumble.flashSteps,
            animStepsPerFrame: crumbleRaw ? readNumberValue(crumbleRaw.animStepsPerFrame, 'crumble.animStepsPerFrame') : DEFAULT_TUNING.crumble.animStepsPerFrame
          },
          room: {
            portalAnimStepsPerFrame: roomRaw ? readNumberValue(roomRaw.portalAnimStepsPerFrame, 'room.portalAnimStepsPerFrame') : DEFAULT_TUNING.room.portalAnimStepsPerFrame
          },
          gemChunk: {
            hp: gemChunkRaw ? readNumberValue(gemChunkRaw.hp, 'gemChunk.hp') : DEFAULT_TUNING.gemChunk.hp,
            gemsPerChunk: gemChunkRaw ? readNumberValue(gemChunkRaw.gemsPerChunk, 'gemChunk.gemsPerChunk') : DEFAULT_TUNING.gemChunk.gemsPerChunk,
            idleStepsPerFrame: gemChunkRaw ? readNumberValue(gemChunkRaw.idleStepsPerFrame, 'gemChunk.idleStepsPerFrame') : DEFAULT_TUNING.gemChunk.idleStepsPerFrame,
            breakStepsPerFrame: gemChunkRaw ? readNumberValue(gemChunkRaw.breakStepsPerFrame, 'gemChunk.breakStepsPerFrame') : DEFAULT_TUNING.gemChunk.breakStepsPerFrame
          },
          flow: {
            fadeSteps: flowRaw ? readNumberValue(flowRaw.fadeSteps, 'flow.fadeSteps') : DEFAULT_TUNING.flow.fadeSteps,
            triggerDepth: flowRaw ? readNumberValue(flowRaw.triggerDepth, 'flow.triggerDepth') : DEFAULT_TUNING.flow.triggerDepth
          }
        };
      }
      function readComboRewardKind(comboRaw) {
        var rk = comboRaw.rewardKind;
        if (typeof rk === 'string') {
          return rk;
        }
        return readStringValue(rk, 'combo.rewardKind');
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

System.register("chunks:///_virtual/WorldScroll.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './FixedStepDriver.ts', './TuningConfig.ts', './LevelData.ts', './RoomManager.ts'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, find, Component, FixedStepDriver, initTuning, getTuning, ROOM_BASE_Y, ROOM_INSTANCES, ROOM_ROWS, LEVEL_TILE_PX, LEVEL_VIEW_OFFSET_X, LEVEL_ROWS, RoomManager;
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
      ROOM_BASE_Y = module.ROOM_BASE_Y;
      ROOM_INSTANCES = module.ROOM_INSTANCES;
      ROOM_ROWS = module.ROOM_ROWS;
      LEVEL_TILE_PX = module.LEVEL_TILE_PX;
      LEVEL_VIEW_OFFSET_X = module.LEVEL_VIEW_OFFSET_X;
      LEVEL_ROWS = module.LEVEL_ROWS;
    }, function (module) {
      RoomManager = module.RoomManager;
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
          if (this._world && !this._world.getComponent(RoomManager)) {
            this._world.addComponent(RoomManager);
          }
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
          var tileSize = tuning.level.tileSize;
          var halfH = tuning.render.designHeight / 2;
          var wellBottom = -LEVEL_ROWS * tileSize;
          var minCamY = wellBottom + halfH;
          var maxCamY = -halfH;
          var py = this._player.position.y;
          var camY = py;
          var roomFixedCam = false;
          if (py < ROOM_BASE_Y) {
            for (var i = 0; i < ROOM_INSTANCES.length; i += 1) {
              var room = ROOM_INSTANCES[i];
              var roomBottom = room.originY - ROOM_ROWS * tileSize;
              if (py <= room.originY && py > roomBottom) {
                var roomCenterY = room.originY - ROOM_ROWS * LEVEL_TILE_PX / 2;
                camY = roomCenterY;
                roomFixedCam = true;
                break;
              }
            }
          }
          if (!roomFixedCam) {
            camY = Math.min(maxCamY, Math.max(minCamY, camY));
          }
          var camWorldY = this._camNode ? this._camNode.worldPosition.y : 0;
          // -8：176px 世界在 160px 视口内居中，左右墙各露 8px
          this._world.setPosition(LEVEL_VIEW_OFFSET_X, camWorldY - camY, 0);
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