"use strict";
// src/ichava-motion.ts
function createMotion() {
	var VERSION = "1.0.0";
	var EASINGS = {
		linear: "linear",
		ease: "ease",
		"ease-in": "ease-in",
		"ease-out": "ease-out",
		"ease-in-out": "ease-in-out",
		spring: "cubic-bezier(.34,1.56,.64,1)",
		back: "cubic-bezier(.68,-.55,.27,1.55)",
		"steps(8)": "steps(8)",
		"ease-in-quad": "cubic-bezier(.55,.06,.68,.19)",
		"ease-out-cubic": "cubic-bezier(.22,.61,.36,1)"
	};
	function resolveEasing(e) {
		if (!e) return "ease-in-out";
		if (EASINGS[e]) return EASINGS[e];
		if (/^(linear|ease(-in|-out|-in-out)?|step-(start|end)|steps\([^)]+\)|cubic-bezier\(\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*(,\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*){3}\))$/.test(String(e).trim())) return e;
		return "ease-in-out";
	}
	var P = "perspective(400px)";
	var GLOW = "var(--ichm-glow-color, currentColor)";
	var VARIANTS = [
		{
			s: "",
			a: 1,
			d: 1,
			r: false
		},
		{
			s: " · Reverse",
			a: 1,
			d: 1,
			r: true
		},
		{
			s: " · Subtle",
			a: .55,
			d: 1.15,
			r: false
		},
		{
			s: " · Subtle · Reverse",
			a: .55,
			d: 1.15,
			r: true
		},
		{
			s: " · Bold",
			a: 1.7,
			d: .8,
			r: false
		},
		{
			s: " · Bold · Reverse",
			a: 1.7,
			d: .8,
			r: true
		}
	];
	var FAMILIES = [
		{
			id: "spin",
			label: "Spin",
			base: 1400,
			kf: function() {
				return [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }];
			}
		},
		{
			id: "spin-y",
			label: "Spin Y",
			base: 1600,
			kf: function() {
				return [{ transform: P + " rotateY(0deg)" }, { transform: P + " rotateY(360deg)" }];
			}
		},
		{
			id: "spin-tilt",
			label: "Spin Tilt",
			base: 1600,
			kf: function() {
				return [{ transform: P + " rotateZ(0deg) rotateX(20deg)" }, { transform: P + " rotateZ(360deg) rotateX(20deg)" }];
			}
		},
		{
			id: "flip-x",
			label: "Flip X",
			base: 1400,
			kf: function() {
				return [{ transform: P + " rotateX(0deg)" }, { transform: P + " rotateX(360deg)" }];
			}
		},
		{
			id: "flip-y",
			label: "Flip Y",
			base: 1400,
			kf: function() {
				return [{ transform: P + " rotateY(0deg)" }, { transform: P + " rotateY(360deg)" }];
			}
		},
		{
			id: "roll",
			label: "Roll",
			base: 1200,
			kf: function(a) {
				return [{
					transform: "translateX(" + -24 * a + "%) rotate(" + -120 * a + "deg)",
					opacity: .4
				}, {
					transform: "translateX(0) rotate(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "orbit",
			label: "Orbit",
			base: 2e3,
			kf: function(a) {
				return [{ transform: "rotate(0deg) translateX(" + 6 * a + "px) rotate(0deg)" }, { transform: "rotate(360deg) translateX(" + 6 * a + "px) rotate(-360deg)" }];
			}
		},
		{
			id: "pulse",
			label: "Pulse",
			base: 1200,
			kf: function(a) {
				return [
					{ opacity: 1 },
					{ opacity: Math.max(.1, 1 - .65 * a) },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "heartbeat",
			label: "Heartbeat",
			base: 1e3,
			kf: function(a) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .18 * a) + ")" },
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .12 * a) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "breathe",
			label: "Breathe",
			base: 3e3,
			kf: function(a) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .08 * a) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "zoom-in",
			label: "Zoom In",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "scale(" + (1 - .4 * a) + ")",
					opacity: 0
				}, {
					transform: "scale(1)",
					opacity: 1
				}];
			}
		},
		{
			id: "zoom-out",
			label: "Zoom Out",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "scale(1)",
					opacity: 1
				}, {
					transform: "scale(" + (1 + .4 * a) + ")",
					opacity: 0
				}];
			}
		},
		{
			id: "pop",
			label: "Pop",
			base: 500,
			once: true,
			kf: function(a) {
				return [
					{ transform: "scale(1)" },
					{ transform: "scale(" + (1 + .25 * a) + ")" },
					{ transform: "scale(1)" }
				];
			}
		},
		{
			id: "rubber-band",
			label: "Rubber Band",
			base: 900,
			once: true,
			kf: function(a) {
				return [
					{ transform: "scale(1,1)" },
					{ transform: "scale(" + (1 + .25 * a) + "," + (1 - .25 * a) + ")" },
					{ transform: "scale(" + (1 - .15 * a) + "," + (1 + .15 * a) + ")" },
					{ transform: "scale(" + (1 + .05 * a) + "," + (1 - .05 * a) + ")" },
					{ transform: "scale(1,1)" }
				];
			}
		},
		{
			id: "jello",
			label: "Jello",
			base: 900,
			once: true,
			kf: function(a) {
				return [
					{ transform: "skewX(0deg) skewY(0deg)" },
					{ transform: "skewX(" + -12 * a + "deg) skewY(" + -12 * a + "deg)" },
					{ transform: "skewX(" + 6 * a + "deg) skewY(" + 6 * a + "deg)" },
					{ transform: "skewX(" + -3 * a + "deg) skewY(" + -3 * a + "deg)" },
					{ transform: "skewX(0) skewY(0)" }
				];
			}
		},
		{
			id: "tada",
			label: "Tada",
			base: 1e3,
			once: true,
			kf: function(a) {
				return [
					{ transform: "scale(1) rotate(0)" },
					{ transform: "scale(" + (1 - .1 * a) + ") rotate(" + -3 * a + "deg)" },
					{ transform: "scale(" + (1 + .1 * a) + ") rotate(" + 3 * a + "deg)" },
					{ transform: "scale(" + (1 + .1 * a) + ") rotate(" + -3 * a + "deg)" },
					{ transform: "scale(1) rotate(0)" }
				];
			}
		},
		{
			id: "bounce",
			label: "Bounce",
			base: 900,
			kf: function(a) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -22 * a + "%)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "float",
			label: "Float",
			base: 2400,
			kf: function(a) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -12 * a + "%)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "hop",
			label: "Hop",
			base: 800,
			kf: function(a) {
				return [
					{ transform: "translateY(0) scaleY(1)" },
					{ transform: "translateY(0) scaleY(0.86)" },
					{ transform: "translateY(" + -24 * a + "%) scaleY(1.05)" },
					{ transform: "translateY(0) scaleY(1)" }
				];
			}
		},
		{
			id: "slide-up",
			label: "Slide Up",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "translateY(" + 30 * a + "%)",
					opacity: 0
				}, {
					transform: "translateY(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-down",
			label: "Slide Down",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "translateY(" + -30 * a + "%)",
					opacity: 0
				}, {
					transform: "translateY(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-left",
			label: "Slide Left",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "translateX(" + 30 * a + "%)",
					opacity: 0
				}, {
					transform: "translateX(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "slide-right",
			label: "Slide Right",
			base: 900,
			once: true,
			kf: function(a) {
				return [{
					transform: "translateX(" + -30 * a + "%)",
					opacity: 0
				}, {
					transform: "translateX(0)",
					opacity: 1
				}];
			}
		},
		{
			id: "shake-x",
			label: "Shake X",
			base: 600,
			kf: function(a) {
				return [
					{ transform: "translateX(0)" },
					{ transform: "translateX(" + -3 * a + "px)" },
					{ transform: "translateX(" + 3 * a + "px)" },
					{ transform: "translateX(" + -2 * a + "px)" },
					{ transform: "translateX(0)" }
				];
			}
		},
		{
			id: "shake-y",
			label: "Shake Y",
			base: 600,
			kf: function(a) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -3 * a + "px)" },
					{ transform: "translateY(" + 3 * a + "px)" },
					{ transform: "translateY(" + -2 * a + "px)" },
					{ transform: "translateY(0)" }
				];
			}
		},
		{
			id: "vibrate",
			label: "Vibrate",
			base: 300,
			kf: function(a) {
				return [
					{ transform: "translate(0,0)" },
					{ transform: "translate(" + -1.5 * a + "px," + 1.5 * a + "px)" },
					{ transform: "translate(" + 1.5 * a + "px," + -1.5 * a + "px)" },
					{ transform: "translate(0,0)" }
				];
			}
		},
		{
			id: "wobble",
			label: "Wobble",
			base: 1e3,
			once: true,
			kf: function(a) {
				return [
					{ transform: "translateX(0) rotate(0)" },
					{ transform: "translateX(" + -12 * a + "%) rotate(" + -5 * a + "deg)" },
					{ transform: "translateX(" + 8 * a + "%) rotate(" + 3 * a + "deg)" },
					{ transform: "translateX(" + -4 * a + "%) rotate(" + -2 * a + "deg)" },
					{ transform: "translateX(0) rotate(0)" }
				];
			}
		},
		{
			id: "wiggle",
			label: "Wiggle",
			base: 800,
			kf: function(a) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + -11 * a + "deg)" },
					{ transform: "rotate(" + 11 * a + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "swing",
			label: "Swing",
			base: 1e3,
			origin: "top center",
			kf: function(a) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + 15 * a + "deg)" },
					{ transform: "rotate(" + -10 * a + "deg)" },
					{ transform: "rotate(" + 5 * a + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "pendulum",
			label: "Pendulum",
			base: 1600,
			origin: "top center",
			kf: function(a) {
				return [
					{ transform: "rotate(" + -20 * a + "deg)" },
					{ transform: "rotate(" + 20 * a + "deg)" },
					{ transform: "rotate(" + -20 * a + "deg)" }
				];
			}
		},
		{
			id: "rock",
			label: "Rock",
			base: 1200,
			origin: "bottom center",
			kf: function(a) {
				return [
					{ transform: "rotate(0deg)" },
					{ transform: "rotate(" + -8 * a + "deg)" },
					{ transform: "rotate(" + 8 * a + "deg)" },
					{ transform: "rotate(0deg)" }
				];
			}
		},
		{
			id: "fade",
			label: "Fade",
			base: 1400,
			kf: function(a) {
				return [{ opacity: Math.max(0, 1 - a) }, { opacity: 1 }];
			}
		},
		{
			id: "blink",
			label: "Blink",
			base: 1e3,
			kf: function() {
				return [
					{ opacity: 1 },
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 0 },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "flash",
			label: "Flash",
			base: 1e3,
			once: true,
			kf: function() {
				return [
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 },
					{ opacity: 0 },
					{ opacity: 1 }
				];
			}
		},
		{
			id: "glow",
			label: "Glow",
			base: 1600,
			kf: function(a) {
				return [
					{ filter: "drop-shadow(0 0 0 " + GLOW + ")" },
					{ filter: "drop-shadow(0 0 " + 5 * a + "px " + GLOW + ")" },
					{ filter: "drop-shadow(0 0 0 " + GLOW + ")" }
				];
			}
		},
		{
			id: "draw",
			label: "Draw",
			base: 1400,
			once: true,
			domOnly: true,
			draw: true,
			stagger: 120,
			kf: function() {
				return [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }];
			}
		},
		{
			id: "reveal",
			label: "Reveal",
			base: 700,
			once: true,
			perChild: true,
			stagger: 90,
			kf: function(a) {
				return [{
					opacity: 0,
					transform: "translateY(" + 14 * a + "px)"
				}, {
					opacity: 1,
					transform: "translateY(0)"
				}];
			}
		},
		{
			id: "cascade",
			label: "Cascade",
			base: 700,
			once: true,
			perChild: true,
			stagger: 110,
			kf: function(a) {
				return [{
					opacity: 0,
					transform: "scale(" + (1 - .3 * a) + ")"
				}, {
					opacity: 1,
					transform: "scale(1)"
				}];
			}
		},
		{
			id: "assemble",
			label: "Assemble",
			base: 800,
			once: true,
			perChild: true,
			stagger: 90,
			kf: function(a) {
				return [{
					opacity: 0,
					transform: "translateX(" + -18 * a + "px) rotate(" + -8 * a + "deg)"
				}, {
					opacity: 1,
					transform: "translateX(0) rotate(0)"
				}];
			}
		},
		{
			id: "parallax",
			label: "Parallax",
			base: 2600,
			perChild: true,
			stagger: 160,
			kf: function(a) {
				return [
					{ transform: "translateY(0)" },
					{ transform: "translateY(" + -7 * a + "px)" },
					{ transform: "translateY(0)" }
				];
			}
		}
	];
	var PRESETS = {};
	function slugVariant(s) {
		return s ? "-" + s.replace(/[·\s]+/g, "").toLowerCase() : "";
	}
	function buildPresets() {
		PRESETS = {};
		for (var i = 0; i < FAMILIES.length; i++) {
			var f = FAMILIES[i];
			for (var j = 0; j < VARIANTS.length; j++) {
				var v = VARIANTS[j];
				var id = f.id + slugVariant(v.s);
				PRESETS[id] = {
					id,
					label: f.label + v.s,
					keyframes: f.kf(v.a),
					base: Math.round(f.base * v.d),
					direction: v.r ? "reverse" : "normal",
					iterations: f.once ? 1 : Infinity,
					once: !!f.once,
					origin: f.origin,
					domOnly: !!f.domOnly,
					draw: !!f.draw,
					perChild: !!f.perChild,
					stagger: f.stagger,
					family: f.id
				};
			}
		}
	}
	buildPresets();
	var CONFIG = {
		defaults: {
			duration: null,
			easing: "ease-in-out",
			delay: 0,
			iterations: null,
			direction: null,
			speed: 1,
			trigger: "load"
		},
		lottie: "off",
		lottiePlayer: null,
		lottieFullAcknowledgeEvalRisk: false,
		reduceMotion: "respect"
	};
	var BLOCKED_KEYS = [
		"__proto__",
		"constructor",
		"prototype"
	];
	function assign(t) {
		for (var i = 1; i < arguments.length; i++) {
			var s = arguments[i];
			if (!s) continue;
			for (var k in s) {
				if (!Object.prototype.hasOwnProperty.call(s, k)) continue;
				if (BLOCKED_KEYS.indexOf(k) !== -1) continue;
				if (t[k] && typeof t[k] === "object" && typeof s[k] === "object" && !Array.isArray(s[k])) assign(t[k], s[k]);
				else t[k] = s[k];
			}
		}
		return t;
	}
	function reduceMotion() {
		if (CONFIG.reduceMotion === "off") return false;
		try {
			return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.hasAttribute("data-reduce-motion");
		} catch (e) {
			return true;
		}
	}
	var LIVE = /* @__PURE__ */ new Set();
	var TEARDOWN = [];
	var reduceBound = false;
	function track(anim) {
		if (!anim) return anim;
		LIVE.add(anim);
		if (typeof anim.addEventListener === "function") {
			var drop = function() {
				LIVE.delete(anim);
			};
			anim.addEventListener("finish", drop);
			anim.addEventListener("cancel", drop);
		}
		bindReducedMotion();
		return anim;
	}
	function bindReducedMotion() {
		if (reduceBound || typeof window === "undefined" || typeof window.matchMedia !== "function") return;
		var mq;
		try {
			mq = window.matchMedia("(prefers-reduced-motion: reduce)");
		} catch (e) {
			return;
		}
		if (!mq || typeof mq.addEventListener !== "function") return;
		var onChange = function() {
			if (reduceMotion()) stopAll();
		};
		mq.addEventListener("change", onChange);
		reduceBound = true;
		TEARDOWN.push(function() {
			mq.removeEventListener("change", onChange);
			reduceBound = false;
		});
	}
	function pauseAll() {
		LIVE.forEach(function(a) {
			a.pause();
		});
	}
	function resumeAll() {
		if (reduceMotion()) return;
		LIVE.forEach(function(a) {
			a.play();
		});
	}
	function stopAll() {
		var all = Array.from(LIVE);
		LIVE.clear();
		all.forEach(function(a) {
			a.cancel();
		});
	}
	function toEl(target) {
		return typeof target === "string" ? document.querySelector(target) : target;
	}
	function onCancel(anim, undo) {
		if (anim && typeof anim.addEventListener === "function") anim.addEventListener("cancel", undo);
		return anim;
	}
	function setInline(node, prop, value) {
		var style = node.style, prev = style[prop];
		style[prop] = value;
		return function() {
			style[prop] = prev;
		};
	}
	function groupHandle(list) {
		if (!list.length) return null;
		var head = list[list.length - 1];
		if (list.length === 1) return head;
		head.animations = list;
		[
			"cancel",
			"pause",
			"play",
			"finish",
			"reverse"
		].forEach(function(m) {
			if (typeof head[m] !== "function") return;
			var own = head[m].bind(head);
			head[m] = function() {
				list.forEach(function(a) {
					if (a !== head && typeof a[m] === "function") a[m]();
				});
				own();
			};
		});
		head.seek = function(ms) {
			list.forEach(function(a) {
				a.currentTime = ms;
			});
		};
		var all = Promise.all(list.map(function(a) {
			return a.finished;
		})).then(function() {
			return head;
		});
		Object.defineProperty(head, "finished", {
			configurable: true,
			get: function() {
				return all;
			}
		});
		return head;
	}
	function timing(spec, opts, extraDelay) {
		var speed = opts.speed != null ? opts.speed : CONFIG.defaults.speed || 1;
		var base = spec.duration != null ? spec.duration : spec.base;
		var duration = opts.duration != null ? opts.duration : Math.max(80, (base || 1e3) / Math.max(.1, speed));
		var iterations = opts.iterations != null ? opts.iterations : spec.iterations != null ? spec.iterations : CONFIG.defaults.iterations != null ? CONFIG.defaults.iterations : Infinity;
		if (iterations === "infinite") iterations = Infinity;
		var dir = opts.direction || spec.direction || CONFIG.defaults.direction || "normal";
		return {
			duration,
			easing: resolveEasing(opts.easing || spec.easing || CONFIG.defaults.easing),
			delay: (opts.delay != null ? opts.delay : CONFIG.defaults.delay || 0) + (extraDelay || 0),
			direction: dir === "reverse" ? "reverse" : dir === "alternate" ? "alternate" : "normal",
			iterations,
			fill: iterations === Infinity ? "none" : "forwards"
		};
	}
	function playSpec(el, spec, opts) {
		el = toEl(el);
		if (!el || !spec || !spec.keyframes || !spec.keyframes.length) return null;
		if (reduceMotion()) return null;
		opts = opts || {};
		var restore = spec.origin && el.style ? setInline(el, "transformOrigin", spec.origin) : null;
		var anim = el.animate(spec.keyframes, timing(spec, opts));
		return track(restore ? onCancel(anim, restore) : anim);
	}
	function childLayers(el) {
		var n = el.querySelectorAll("[data-layer]");
		if (n.length) return n;
		n = el.querySelectorAll(":scope > g, :scope > path");
		return n.length ? n : el.children;
	}
	function undoAll(list) {
		return function() {
			list.forEach(function(u) {
				u();
			});
		};
	}
	function playChildren(el, spec, opts) {
		opts = opts || {};
		var kids = childLayers(el);
		if (!kids || !kids.length) return playSpec(el, spec, opts);
		var stagger = opts.stagger != null ? opts.stagger : spec.stagger != null ? spec.stagger : 90;
		var made = [];
		for (var i = 0; i < kids.length; i++) {
			var kid = kids[i], undo = [];
			var styled = !!kid.style;
			if (spec.origin && styled) undo.push(setInline(kid, "transformOrigin", spec.origin));
			if (styled && kid.ownerSVGElement !== void 0) undo.push(setInline(kid, "transformBox", "fill-box"));
			var anim = kid.animate(spec.keyframes, timing(spec, opts, i * stagger));
			made.push(undo.length ? onCancel(anim, undoAll(undo)) : anim);
		}
		return track(groupHandle(made));
	}
	function drawPaths(el, spec, opts) {
		opts = opts || {};
		var paths = el.querySelectorAll("path, line, polyline, polygon, circle, rect");
		if (!paths.length) return playSpec(el, spec, opts);
		var stagger = opts.stagger != null ? opts.stagger : spec.stagger != null ? spec.stagger : 120;
		var made = [], drawn = 0;
		for (var i = 0; i < paths.length; i++) {
			var p = paths[i], len = 0;
			try {
				len = p.getTotalLength ? p.getTotalLength() : 0;
			} catch (e) {
				len = 0;
			}
			if (!len) continue;
			var undoArray = setInline(p, "strokeDasharray", String(len));
			var undoOffset = setInline(p, "strokeDashoffset", String(len));
			made.push(onCancel(p.animate([{ strokeDashoffset: len }, { strokeDashoffset: 0 }], timing(spec, opts, drawn++ * stagger)), undoAll([undoOffset, undoArray])));
		}
		return track(groupHandle(made));
	}
	function play(el, presetId, opts) {
		var spec = PRESETS[presetId];
		if (!spec) return null;
		var node = toEl(el);
		if (!node) return null;
		if (reduceMotion()) return null;
		if (spec.draw) return drawPaths(node, spec, opts || {});
		if (spec.perChild) return playChildren(node, spec, opts || {});
		return playSpec(node, spec, opts);
	}
	function animate(el, source, opts) {
		if (typeof source === "string") return play(el, source, opts);
		if (source && source.layers && source.v && source.ip != null) return runLottie(el, source, opts);
		return playSpec(el, source, opts);
	}
	function runLottie(el, json, opts) {
		if (CONFIG.lottie === "import" && window.IchavaMotionLottie) {
			var spec = window.IchavaMotionLottie.toSpec(json);
			if (spec) return playSpec(el, spec, opts);
		}
		if (CONFIG.lottie === "full") return loadLottieWeb(toEl(el), json);
		if (window.IchavaMotionLottie) {
			var s = window.IchavaMotionLottie.toSpec(json);
			if (s) return playSpec(el, s, opts);
		}
		return null;
	}
	var lottieWarned = false;
	var lottieRiskWarned = false;
	function resolveLottiePlayer() {
		if (CONFIG.lottiePlayer) return CONFIG.lottiePlayer;
		if (typeof window !== "undefined" && window.lottie) return window.lottie;
		return null;
	}
	function loadLottieWeb(el, json) {
		if (!el) return null;
		if (!CONFIG.lottieFullAcknowledgeEvalRisk) {
			if (!lottieRiskWarned) {
				lottieRiskWarned = true;
				console.warn("[ichava-motion] lottie:\"full\" is disabled. The full lottie-web build evaluates expressions in the animation JSON with eval, so untrusted JSON would run as code. Use lottie:\"import\" or lottie_light for untrusted input, or, if every file is yours, opt in with IchavaMotion.config({ lottieFullAcknowledgeEvalRisk: true }).");
			}
			return null;
		}
		var lottie = resolveLottiePlayer();
		if (!lottie) {
			if (!lottieWarned) {
				lottieWarned = true;
				console.warn("[ichava-motion] lottie:\"full\" needs a lottie-web player, and this library will not fetch one. Load lottie-web yourself (npm, or a <script> you control) and either expose it as window.lottie or pass it in: IchavaMotion.config({ lottiePlayer: lottie }).");
			}
			return null;
		}
		lottie.loadAnimation({
			container: el,
			renderer: "svg",
			loop: true,
			autoplay: true,
			animationData: json
		});
		return null;
	}
	function num(attr, v, fallback, min, max) {
		var n = parseFloat(v);
		if (n === n && n >= min && n <= max) return n;
		console.warn("[ichava-motion] " + attr + "=\"" + v + "\" is not a number in [" + min + ", " + max + "]; using the default.");
		return fallback;
	}
	var F = Number.MAX_VALUE;
	function readOpts(el) {
		var d = el.dataset;
		var o = {};
		var x;
		if (d.motionSpeed && (x = num("data-motion-speed", d.motionSpeed, void 0, -Infinity, Infinity)) !== void 0) o.speed = x;
		if (d.motionDuration && (x = num("data-motion-duration", d.motionDuration, void 0, 0, Infinity)) !== void 0) o.duration = x;
		if (d.motionEasing) o.easing = d.motionEasing;
		if (d.motionDelay && (x = num("data-motion-delay", d.motionDelay, void 0, -F, F)) !== void 0) o.delay = x;
		if (d.motionDirection) o.direction = d.motionDirection;
		if (d.motionIterations) {
			if (d.motionIterations === "infinite") o.iterations = Infinity;
			else if ((x = num("data-motion-iterations", d.motionIterations, void 0, 0, Infinity)) !== void 0) o.iterations = x;
		}
		if (d.motionStagger && (x = num("data-motion-stagger", d.motionStagger, void 0, -F, F)) !== void 0) o.stagger = x;
		return o;
	}
	var WIRED = /* @__PURE__ */ new WeakMap();
	function wire(el) {
		if (WIRED.has(el)) return;
		var offs = [];
		var id = el.getAttribute("data-ichava-motion");
		var trigger = el.getAttribute("data-motion-trigger") || CONFIG.defaults.trigger || "load";
		var opts = readOpts(el);
		var current = null;
		function start(o) {
			if (current) current.cancel();
			current = play(el, id, o || opts);
			return current;
		}
		function on(type, fn) {
			el.addEventListener(type, fn);
			offs.push(function() {
				el.removeEventListener(type, fn);
			});
		}
		offs.push(function() {
			if (current) current.cancel();
			current = null;
		});
		WIRED.set(el, function() {
			offs.forEach(function(f) {
				f();
			});
		});
		if (trigger === "load") start();
		else if (trigger === "loop") start({ iterations: Infinity });
		else if (trigger === "hover") {
			on("mouseenter", function() {
				start();
			});
			on("mouseleave", function() {
				if (current) current.cancel();
			});
		} else if (trigger === "click") on("click", function() {
			if (current && current.playState === "running") current.cancel();
			else start();
		});
		else if (trigger === "visible") {
			if ("IntersectionObserver" in window) {
				var io = new IntersectionObserver(function(entries) {
					entries.forEach(function(e) {
						if (e.isIntersecting) {
							start({ iterations: PRESETS[id] && PRESETS[id].once ? 1 : opts.iterations });
							io.unobserve(el);
						}
					});
				});
				io.observe(el);
				offs.push(function() {
					io.disconnect();
				});
			} else start();
		}
	}
	function unwireOne(el) {
		var off = WIRED.get(el);
		if (!off) return;
		WIRED.delete(el);
		off();
	}
	function unwire(root) {
		var r = root || document;
		unwireOne(r);
		r.querySelectorAll("[data-ichava-motion]").forEach(unwireOne);
	}
	function observe(root) {
		if (typeof MutationObserver === "undefined") return;
		var mo = new MutationObserver(function(records) {
			records.forEach(function(rec) {
				rec.removedNodes.forEach(function(n) {
					if (n.nodeType === 1 && !n.isConnected) unwire(n);
				});
				rec.addedNodes.forEach(function(n) {
					if (n.nodeType !== 1) return;
					if (n.hasAttribute("data-ichava-motion")) wire(n);
					n.querySelectorAll("[data-ichava-motion]").forEach(wire);
				});
			});
		});
		mo.observe(root, {
			childList: true,
			subtree: true
		});
		TEARDOWN.push(function() {
			mo.disconnect();
		});
	}
	function bindPauseControl(target) {
		var btn = toEl(target);
		if (!btn) return;
		var paused = false;
		btn.setAttribute("aria-pressed", "false");
		var onClick = function() {
			paused = !paused;
			if (paused) pauseAll();
			else resumeAll();
			btn.setAttribute("aria-pressed", String(paused));
		};
		btn.addEventListener("click", onClick);
		TEARDOWN.push(function() {
			btn.removeEventListener("click", onClick);
		});
	}
	function auto(rootOrOptions, options) {
		var root, o;
		if (rootOrOptions && typeof rootOrOptions.querySelectorAll === "function") {
			root = rootOrOptions;
			o = options || {};
		} else {
			root = document;
			o = rootOrOptions || options || {};
		}
		root.querySelectorAll("[data-ichava-motion]").forEach(wire);
		if (o.observe) observe(root);
		if (o.pauseControl) bindPauseControl(o.pauseControl);
	}
	function destroy() {
		if (typeof document !== "undefined") unwire(document);
		stopAll();
		var undo = TEARDOWN;
		TEARDOWN = [];
		undo.forEach(function(f) {
			f();
		});
	}
	var IchavaMotion = {
		version: VERSION,
		config: function(o) {
			assign(CONFIG, o || {});
			return this;
		},
		animate,
		play,
		playSpec,
		fromJSON: function(el, def, opts) {
			opts = opts || {};
			if (opts.trigger === "loop") opts.iterations = Infinity;
			return playSpec(el, def, opts);
		},
		auto,
		unwire,
		destroy,
		pauseAll: function() {
			pauseAll();
			return this;
		},
		resumeAll: function() {
			resumeAll();
			return this;
		},
		stopAll: function() {
			stopAll();
			return this;
		},
		presets: function() {
			return PRESETS;
		},
		presetIds: function() {
			return Object.keys(PRESETS);
		},
		easings: function() {
			return assign({}, EASINGS);
		},
		register: function(id, spec) {
			PRESETS[id] = assign({
				id,
				keyframes: [],
				base: 1e3,
				iterations: Infinity,
				direction: "normal"
			}, spec);
			return this;
		},
		registerFamily: function(family) {
			FAMILIES.push(family);
			buildPresets();
			return this;
		},
		registerVariant: function(variant) {
			VARIANTS.push(variant);
			buildPresets();
			return this;
		},
		registerEasing: function(name, value) {
			EASINGS[name] = value;
			return this;
		},
		create: function() {
			return createMotion();
		},
		catalog: function() {
			return {
				families: FAMILIES.map(function(f) {
					return assign({}, f);
				}),
				variants: VARIANTS.map(function(v) {
					return assign({}, v);
				})
			};
		}
	};
	IchavaMotion.autoInit = function autoInit(options) {
		if (typeof document === "undefined") return IchavaMotion;
		var o = options || {};
		if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function() {
			auto(o);
		});
		else auto(o);
		return IchavaMotion;
	};
	return IchavaMotion;
}
/** The default instance: the module's default export and the `<script>` global. */
var IchavaMotion = createMotion();
if (typeof globalThis !== "undefined" && typeof globalThis.document !== "undefined") globalThis.IchavaMotion = IchavaMotion;
module.exports = IchavaMotion;

//# sourceMappingURL=ichava-motion.cjs.map