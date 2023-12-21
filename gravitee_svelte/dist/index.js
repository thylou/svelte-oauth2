(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('svelte/internal'), require('svelte/internal/disclose-version'), require('svelte/store')) :
    typeof define === 'function' && define.amd ? define(['exports', 'svelte/internal', 'svelte/internal/disclose-version', 'svelte/store'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Auth = {}, global.internal, null, global.store));
})(this, (function (exports, internal, discloseVersion, store) { 'use strict';

    class NotImplemented {
        message;
        constructor(message) {
            this.message = message;
        }
        get name() {
            return "NotImplemented";
        }
    }

    class Unauthorized {
        get message() {
            return "Unauthorized to access to the resource";
        }
        get name() {
            return "Unauthorized";
        }
    }

    let tokenStorageType = "cookie";
    let oauthIntegration;
    let oauthGrant;
    let initDoneResolve = false;
    /**
     * Setup the OAuth
     *
     * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app). The existing flavor: SvelteKit, and normal Svelte (browser side only)
     * @param {Grant} grant The OAuth grant type (Client Credentials, Authorization Code, Authorization Code with PKCE)
     * @param {"cookie"|"localStorage"} storage Where to store the OAuth token (default: cookie)
     */
    const init$1 = (integration, grant, storage = "cookie") => {
        oauthGrant = grant;
        oauthIntegration = integration;
        tokenStorageType = storage;
        if (initDoneResolve === true) {
            return;
        }
        if (typeof initDoneResolve === "function") {
            initDoneResolve();
        }
        else {
            initDoneResolve = true;
        }
    };
    const initDone = () => {
        if (initDoneResolve === true) {
            return Promise.resolve();
        }
        return new Promise(resolve => {
            initDoneResolve = resolve;
        });
    };
    const getGrant = () => oauthGrant;
    const getTokenStorageType = () => tokenStorageType;
    /**
     * Indicate if token exist in the storage
     *
     * @return {Promise<boolean>}
     */
    const hasToken = async () => {
        const tokenData = (await oauthIntegration.tokenStorage()).get();
        return tokenData !== undefined && tokenData !== null;
    };
    /**
     * Indicate if token in the storage is expired.
     *
     * (A token that don"t have an expiration date is never expired)
     *
     * @return {Promise<boolean>}
     */
    const tokenExpired = async () => {
        const tokenData = (await oauthIntegration.tokenStorage()).get();
        const _now = (new Date()).getTime() / 1000;
        let retVal = false;
        if (tokenData === undefined || tokenData === null)
            return false;
        if (tokenData.expires_in) {
            retVal = Object.keys(tokenData).includes("expires_in") && tokenData.expires_in < _now;
        }
        return retVal;
    };
    const refreshToken = () => {
        throw new NotImplemented("Refresh token not implemented");
    };
    /**
     * Check if the provided scopes are defined in the stored token
     *
     * @param {Array<string>} scopes List of scopes to check
     *
     * @return {Promise<boolean>}
     */
    const isAuthorized = async (scopes) => {
        const tokenData = (await oauthIntegration.tokenStorage()).get();
        if (tokenData === null) {
            return false;
        }
        const tokenScopes = tokenData?.scope?.split(" ");
        const intersection = (array1, array2) => {
            return array1.filter(item => array2.includes(item));
        };
        return intersection(scopes, tokenScopes).length === scopes.length;
    };
    /**
     * Add authorization header with the stored token
     *
     * @param {Headers} headers
     *
     * @return {Promise<Headers>}
     */
    const addAuthHeader = async (headers) => {
        if (headers === undefined) {
            headers = new Headers();
        }
        headers.set("Authorization", `Bearer ${(await oauthIntegration?.tokenStorage())?.get()?.access_token || ""}`);
        return headers;
    };
    const runOAuth2Process = async (scopes) => {
        try {
            await initDone();
            await getGrant().onRequest();
            if (!(await hasToken())) {
                return await getGrant().onUnauthenticated(scopes);
            }
            else if (await tokenExpired()) {
                return refreshToken();
            }
            else if (!(await isAuthorized(scopes))) {
                return Promise.reject(new Unauthorized());
            }
            else {
                return true;
            }
        }
        catch (e) {
            return Promise.reject(e);
        }
    };

    function get_current_component() {
    	throw new Error('Function called outside component initialization');
    }

    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * If a function is returned _synchronously_ from `onMount`, it will be called when the component is unmounted.
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs/svelte#onmount
     * @template T
     * @param {() => import('./private.js').NotFunction<T> | Promise<import('./private.js').NotFunction<T>> | (() => any)} fn
     * @returns {void}
     */
    function onMount(fn) {
    	get_current_component().$$.on_mount.push(fn);
    }

    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * The event dispatcher can be typed to narrow the allowed event names and the type of the `detail` argument:
     * ```ts
     * const dispatch = createEventDispatcher<{
     *  loaded: never; // does not take a detail argument
     *  change: string; // takes a detail argument of type string, which is required
     *  optional: number | null; // takes an optional detail argument of type number
     * }>();
     * ```
     *
     * https://svelte.dev/docs/svelte#createeventdispatcher
     * @template {Record<string, any>} [EventMap=any]
     * @returns {import('./public.js').EventDispatcher<EventMap>}
     */
    function createEventDispatcher() {
    	const component = get_current_component();
    	return (type, detail, { cancelable = false } = {}) => {
    		component.$$.callbacks[type];
    		return true;
    	};
    }

    /* src/Component.svelte generated by Svelte v4.2.8 */
    const get_error_slot_changes = dirty => ({ error: dirty & /*authentication*/ 1 });
    const get_error_slot_context = ctx => ({ error: /*error*/ ctx[8] });
    const get_loading_slot_changes = dirty => ({});
    const get_loading_slot_context = ctx => ({});

    // (31:0) {:catch error}
    function create_catch_block(ctx) {
    	let current;
    	const error_slot_template = /*#slots*/ ctx[5].error;
    	const error_slot = internal.create_slot(error_slot_template, ctx, /*$$scope*/ ctx[4], get_error_slot_context);
    	const error_slot_or_fallback = error_slot || fallback_block_1(ctx);

    	return {
    		c() {
    			if (error_slot_or_fallback) error_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (error_slot_or_fallback) {
    				error_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (error_slot) {
    				if (error_slot.p && (!current || dirty & /*$$scope, authentication*/ 17)) {
    					internal.update_slot_base(
    						error_slot,
    						error_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? internal.get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: internal.get_slot_changes(error_slot_template, /*$$scope*/ ctx[4], dirty, get_error_slot_changes),
    						get_error_slot_context
    					);
    				}
    			} else {
    				if (error_slot_or_fallback && error_slot_or_fallback.p && (!current || dirty & /*authentication*/ 1)) {
    					error_slot_or_fallback.p(ctx, !current ? -1 : dirty);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			internal.transition_in(error_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			internal.transition_out(error_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (error_slot_or_fallback) error_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (32:31)          
    function fallback_block_1(ctx) {
    	let t0_value = /*error*/ ctx[8].name + "";
    	let t0;
    	let t1;
    	let t2_value = /*error*/ ctx[8].message + "";
    	let t2;

    	return {
    		c() {
    			t0 = internal.text(t0_value);
    			t1 = internal.text(": ");
    			t2 = internal.text(t2_value);
    		},
    		m(target, anchor) {
    			internal.insert(target, t0, anchor);
    			internal.insert(target, t1, anchor);
    			internal.insert(target, t2, anchor);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*authentication*/ 1 && t0_value !== (t0_value = /*error*/ ctx[8].name + "")) internal.set_data(t0, t0_value);
    			if (dirty & /*authentication*/ 1 && t2_value !== (t2_value = /*error*/ ctx[8].message + "")) internal.set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) {
    				internal.detach(t0);
    				internal.detach(t1);
    				internal.detach(t2);
    			}
    		}
    	};
    }

    // (28:0) {:then ok}
    function create_then_block(ctx) {
    	let t0_value = /*authOk*/ ctx[1](/*ok*/ ctx[7]) + "";
    	let t0;
    	let t1;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = internal.create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);

    	return {
    		c() {
    			t0 = internal.text(t0_value);
    			t1 = internal.space();
    			if (default_slot) default_slot.c();
    		},
    		m(target, anchor) {
    			internal.insert(target, t0, anchor);
    			internal.insert(target, t1, anchor);

    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty & /*authentication*/ 1) && t0_value !== (t0_value = /*authOk*/ ctx[1](/*ok*/ ctx[7]) + "")) internal.set_data(t0, t0_value);

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					internal.update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? internal.get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: internal.get_slot_changes(default_slot_template, /*$$scope*/ ctx[4], dirty, null),
    						null
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			internal.transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			internal.transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) {
    				internal.detach(t0);
    				internal.detach(t1);
    			}

    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    }

    // (24:23)      <slot name="loading">         <progress />     </slot> {:then ok}
    function create_pending_block(ctx) {
    	let current;
    	const loading_slot_template = /*#slots*/ ctx[5].loading;
    	const loading_slot = internal.create_slot(loading_slot_template, ctx, /*$$scope*/ ctx[4], get_loading_slot_context);
    	const loading_slot_or_fallback = loading_slot || fallback_block();

    	return {
    		c() {
    			if (loading_slot_or_fallback) loading_slot_or_fallback.c();
    		},
    		m(target, anchor) {
    			if (loading_slot_or_fallback) {
    				loading_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (loading_slot) {
    				if (loading_slot.p && (!current || dirty & /*$$scope*/ 16)) {
    					internal.update_slot_base(
    						loading_slot,
    						loading_slot_template,
    						ctx,
    						/*$$scope*/ ctx[4],
    						!current
    						? internal.get_all_dirty_from_scope(/*$$scope*/ ctx[4])
    						: internal.get_slot_changes(loading_slot_template, /*$$scope*/ ctx[4], dirty, get_loading_slot_changes),
    						get_loading_slot_context
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			internal.transition_in(loading_slot_or_fallback, local);
    			current = true;
    		},
    		o(local) {
    			internal.transition_out(loading_slot_or_fallback, local);
    			current = false;
    		},
    		d(detaching) {
    			if (loading_slot_or_fallback) loading_slot_or_fallback.d(detaching);
    		}
    	};
    }

    // (25:25)          
    function fallback_block(ctx) {
    	let progress;

    	return {
    		c() {
    			progress = internal.element("progress");
    		},
    		m(target, anchor) {
    			internal.insert(target, progress, anchor);
    		},
    		p: internal.noop,
    		d(detaching) {
    			if (detaching) {
    				internal.detach(progress);
    			}
    		}
    	};
    }

    function create_fragment(ctx) {
    	let await_block_anchor;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 7,
    		error: 8,
    		blocks: [,,,]
    	};

    	internal.handle_promise(promise = /*authentication*/ ctx[0], info);

    	return {
    		c() {
    			await_block_anchor = internal.empty();
    			info.block.c();
    		},
    		m(target, anchor) {
    			internal.insert(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*authentication*/ 1 && promise !== (promise = /*authentication*/ ctx[0]) && internal.handle_promise(promise, info)) ; else {
    				internal.update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i(local) {
    			if (current) return;
    			internal.transition_in(info.block);
    			current = true;
    		},
    		o(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				internal.transition_out(block);
    			}

    			current = false;
    		},
    		d(detaching) {
    			if (detaching) {
    				internal.detach(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const dispatch = createEventDispatcher();
    	let { scopes = [] } = $$props;
    	let { authentication = runOAuth2Process(scopes) } = $$props;
    	let authenticated = false;

    	onMount(() => {
    		if (typeof authentication === "undefined") {
    			$$invalidate(0, authentication = runOAuth2Process(scopes));
    		}
    	});

    	const authOk = v => {
    		$$invalidate(3, authenticated = true);
    		return '';
    	};

    	$$self.$$set = $$props => {
    		if ('scopes' in $$props) $$invalidate(2, scopes = $$props.scopes);
    		if ('authentication' in $$props) $$invalidate(0, authentication = $$props.authentication);
    		if ('$$scope' in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*authenticated*/ 8) {
    			if (authenticated) {
    				dispatch("authenticated", {});
    			}
    		}
    	};

    	return [authentication, authOk, scopes, authenticated, $$scope, slots];
    }

    class Component extends internal.SvelteComponent {
    	constructor(options) {
    		super();
    		internal.init(this, options, instance, create_fragment, internal.safe_not_equal, { scopes: 2, authentication: 0 });
    	}
    }

    /*! js-cookie v3.0.5 | MIT */
    /* eslint-disable no-var */
    function assign (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          target[key] = source[key];
        }
      }
      return target
    }
    /* eslint-enable no-var */

    /* eslint-disable no-var */
    var defaultConverter = {
      read: function (value) {
        if (value[0] === '"') {
          value = value.slice(1, -1);
        }
        return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
      },
      write: function (value) {
        return encodeURIComponent(value).replace(
          /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
          decodeURIComponent
        )
      }
    };
    /* eslint-enable no-var */

    /* eslint-disable no-var */

    function init (converter, defaultAttributes) {
      function set (name, value, attributes) {
        if (typeof document === 'undefined') {
          return
        }

        attributes = assign({}, defaultAttributes, attributes);

        if (typeof attributes.expires === 'number') {
          attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
        }
        if (attributes.expires) {
          attributes.expires = attributes.expires.toUTCString();
        }

        name = encodeURIComponent(name)
          .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
          .replace(/[()]/g, escape);

        var stringifiedAttributes = '';
        for (var attributeName in attributes) {
          if (!attributes[attributeName]) {
            continue
          }

          stringifiedAttributes += '; ' + attributeName;

          if (attributes[attributeName] === true) {
            continue
          }

          // Considers RFC 6265 section 5.2:
          // ...
          // 3.  If the remaining unparsed-attributes contains a %x3B (";")
          //     character:
          // Consume the characters of the unparsed-attributes up to,
          // not including, the first %x3B (";") character.
          // ...
          stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
        }

        return (document.cookie =
          name + '=' + converter.write(value, name) + stringifiedAttributes)
      }

      function get (name) {
        if (typeof document === 'undefined' || (arguments.length && !name)) {
          return
        }

        // To prevent the for loop in the first place assign an empty array
        // in case there are no cookies at all.
        var cookies = document.cookie ? document.cookie.split('; ') : [];
        var jar = {};
        for (var i = 0; i < cookies.length; i++) {
          var parts = cookies[i].split('=');
          var value = parts.slice(1).join('=');

          try {
            var found = decodeURIComponent(parts[0]);
            jar[found] = converter.read(value, found);

            if (name === found) {
              break
            }
          } catch (e) {}
        }

        return name ? jar[name] : jar
      }

      return Object.create(
        {
          set,
          get,
          remove: function (name, attributes) {
            set(
              name,
              '',
              assign({}, attributes, {
                expires: -1
              })
            );
          },
          withAttributes: function (attributes) {
            return init(this.converter, assign({}, this.attributes, attributes))
          },
          withConverter: function (converter) {
            return init(assign({}, this.converter, converter), this.attributes)
          }
        },
        {
          attributes: { value: Object.freeze(defaultAttributes) },
          converter: { value: Object.freeze(converter) }
        }
      )
    }

    var api = init(defaultConverter, { path: '/' });

    let cookieName = "svelte-oauth-token";
    const setCookieName = (value) => cookieName = value;

    const browserCookie = {
        remove() {
            api.remove(cookieName, { samesite: "Strict" });
        },
        get() {
            const value = api.get(cookieName);
            if (value === null) {
                return null;
            }
            try {
                return JSON.parse(value);
            }
            catch (e) {
                return null;
            }
        }, set(token) {
            api.set(cookieName, JSON.stringify(token), { samesite: "Strict" });
        }
    };

    const localStorage = {
        get() {
            if (typeof window === "undefined" || !Object.keys(window).includes("localStorage")) {
                return undefined;
            }
            const value = window.localStorage.getItem("svelte-oauth-token");
            if (value === null) {
                return null;
            }
            try {
                return JSON.parse(value);
            }
            catch (e) {
                return null;
            }
        }, set(token) {
            if (typeof window === "undefined" || !Object.keys(window).includes("localStorage")) {
                return;
            }
            window.localStorage.setItem("svelte-oauth-token", JSON.stringify(token));
        },
        remove() {
            if (typeof window === "undefined" || !Object.keys(window).includes("localStorage")) {
                return;
            }
            window.localStorage.removeItem("svelte-oauth-token");
        }
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    /*!
     * cookie
     * Copyright(c) 2012-2014 Roman Shtylman
     * Copyright(c) 2015 Douglas Christopher Wilson
     * MIT Licensed
     */

    /**
     * Module exports.
     * @public
     */

    var parse_1 = parse;
    var serialize_1 = serialize;

    /**
     * Module variables.
     * @private
     */

    var decode = decodeURIComponent;
    var encode$1 = encodeURIComponent;

    /**
     * RegExp to match field-content in RFC 7230 sec 3.2
     *
     * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
     * field-vchar   = VCHAR / obs-text
     * obs-text      = %x80-FF
     */

    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

    /**
     * Parse a cookie header.
     *
     * Parse the given cookie header string into an object
     * The object has the various cookies as keys(names) => values
     *
     * @param {string} str
     * @param {object} [options]
     * @return {object}
     * @public
     */

    function parse(str, options) {
      if (typeof str !== 'string') {
        throw new TypeError('argument str must be a string');
      }

      var obj = {};
      var opt = options || {};
      var pairs = str.split(';');
      var dec = opt.decode || decode;

      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var index = pair.indexOf('=');

        // skip things that don't look like key=value
        if (index < 0) {
          continue;
        }

        var key = pair.substring(0, index).trim();

        // only assign once
        if (undefined == obj[key]) {
          var val = pair.substring(index + 1, pair.length).trim();

          // quoted values
          if (val[0] === '"') {
            val = val.slice(1, -1);
          }

          obj[key] = tryDecode(val, dec);
        }
      }

      return obj;
    }

    /**
     * Serialize data into a cookie header.
     *
     * Serialize the a name value pair into a cookie string suitable for
     * http headers. An optional options object specified cookie parameters.
     *
     * serialize('foo', 'bar', { httpOnly: true })
     *   => "foo=bar; httpOnly"
     *
     * @param {string} name
     * @param {string} val
     * @param {object} [options]
     * @return {string}
     * @public
     */

    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode$1;

      if (typeof enc !== 'function') {
        throw new TypeError('option encode is invalid');
      }

      if (!fieldContentRegExp.test(name)) {
        throw new TypeError('argument name is invalid');
      }

      var value = enc(val);

      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError('argument val is invalid');
      }

      var str = name + '=' + value;

      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;

        if (isNaN(maxAge) || !isFinite(maxAge)) {
          throw new TypeError('option maxAge is invalid')
        }

        str += '; Max-Age=' + Math.floor(maxAge);
      }

      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError('option domain is invalid');
        }

        str += '; Domain=' + opt.domain;
      }

      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError('option path is invalid');
        }

        str += '; Path=' + opt.path;
      }

      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== 'function') {
          throw new TypeError('option expires is invalid');
        }

        str += '; Expires=' + opt.expires.toUTCString();
      }

      if (opt.httpOnly) {
        str += '; HttpOnly';
      }

      if (opt.secure) {
        str += '; Secure';
      }

      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === 'string'
          ? opt.sameSite.toLowerCase() : opt.sameSite;

        switch (sameSite) {
          case true:
            str += '; SameSite=Strict';
            break;
          case 'lax':
            str += '; SameSite=Lax';
            break;
          case 'strict':
            str += '; SameSite=Strict';
            break;
          case 'none':
            str += '; SameSite=None';
            break;
          default:
            throw new TypeError('option sameSite is invalid');
        }
      }

      return str;
    }

    /**
     * Try decoding a string using a decoding function.
     *
     * @param {string} str
     * @param {function} decode
     * @private
     */

    function tryDecode(str, decode) {
      try {
        return decode(str);
      } catch (e) {
        return str;
      }
    }

    let requestCookies = "";
    let responseCookie = "";
    const setRequestCookies = (cookies) => {
        requestCookies = cookies;
        responseCookie = "";
    };
    const getResponseCookie = () => {
        return responseCookie;
    };
    const serverCookie = {
        remove() {
            responseCookie = serialize_1(cookieName, "deleted", {
                expires: new Date(0),
                sameSite: "strict"
            });
        },
        get() {
            const cookies = parse_1(requestCookies);
            if (!Object.keys(cookies).includes(cookieName)) {
                return null;
            }
            try {
                return JSON.parse(cookies[cookieName]);
            }
            catch (e) {
                return null;
            }
        }, set(token) {
            responseCookie = serialize_1(cookieName, JSON.stringify(token), {
                sameSite: "strict"
            });
            requestCookies = responseCookie;
        }
    };

    const inMemoryStorage = {};
    const svelteKitStrategy = new class {
        fetchFunc;
        redirectedTo = null;
        queryObject = null;
        fetch(uri, options) {
            return this.fetchFunc(uri, options);
        }
        async redirect(url) {
            const navigation = await import('$app/navigation');
            const env = await import('$app/environment');
            if (env.browser) {
                return navigation.goto(url);
            }
            else {
                this.redirectedTo = url;
                return Promise.resolve();
            }
        }
        async query() {
            if (this.queryObject !== null) {
                return Promise.resolve(this.queryObject);
            }
            const stores = await import('$app/stores');
            return store.get(stores.page).url.searchParams;
        }
        getRedirection() {
            const redirection = this.redirectedTo + "";
            this.redirectedTo = null;
            return redirection;
        }
        /**
         * Set the fetch function to use
         * @param {Function} func
         */
        setFetch(func) {
            this.fetchFunc = func;
        }
        /**
         * Set the request Query
         * @param query
         */
        setQuery(query) {
            this.queryObject = query;
        }
        async tokenStorage() {
            const env = await import('$app/environment');
            if (getTokenStorageType() === "cookie") {
                return env.browser ? browserCookie : serverCookie;
            }
            return localStorage;
        }
        /**
         * Handle hooks for SSR
         * @param {import("@sveltejs/kit/types/hooks").ServerRequest} request The server request
         * @param {Function} resolve The request resolver
         */
        async handleHook({ request, resolve }) {
            const env = await import('$app/environment');
            if (getTokenStorageType() === "cookie" && !env.browser) {
                setRequestCookies(request.headers["cookie"] || "");
            }
            /** @type {Promise<ServerResponse>} response */
            const response = resolve(request);
            return Promise.resolve(response).then((response) => {
                const cookies = getResponseCookie();
                if (cookies !== "") {
                    let existing = response.headers["set-cookie"] || [];
                    if (typeof existing === "string")
                        existing = [existing];
                    existing.push(cookies);
                    response.headers["set-cookie"] = existing;
                }
                const redirection = this.getRedirection();
                if (redirection !== null && redirection !== "null") {
                    response.status = 302;
                    response.headers.location = redirection;
                    response.body = null;
                }
                return response;
            });
        }
        async getFromTemporary(key) {
            const env = await import('$app/environment');
            if (!env.browser) {
                return inMemoryStorage[key] || null;
            }
            return window.sessionStorage.getItem(key);
        }
        async saveInTemporary(key, data) {
            const env = await import('$app/environment');
            if (!env.browser) {
                inMemoryStorage[key] = data;
                return;
            }
            return window.sessionStorage.setItem(key, data);
        }
    };
    const browserStrategy = new class {
        redirect(url) {
            window.location.href = url;
            return Promise.resolve();
        }
        query() {
            return Promise.resolve(new URL(window.location.href).searchParams);
        }
        fetch(uri, options) {
            return fetch(uri, options);
        }
        tokenStorage() {
            if (getTokenStorageType() === "cookie") {
                return Promise.resolve(browserCookie);
            }
            return Promise.resolve(localStorage);
        }
        getFromTemporary(key) {
            return Promise.resolve(sessionStorage.getItem(key));
        }
        saveInTemporary(key, data) {
            sessionStorage.setItem(key, data);
            return Promise.resolve();
        }
    };

    /**
     *  base64.ts
     *
     *  Licensed under the BSD 3-Clause License.
     *    http://opensource.org/licenses/BSD-3-Clause
     *
     *  References:
     *    http://en.wikipedia.org/wiki/Base64
     *
     * @author Dan Kogai (https://github.com/dankogai)
     */
    const _hasbtoa = typeof btoa === 'function';
    const _hasBuffer = typeof Buffer === 'function';
    typeof TextDecoder === 'function' ? new TextDecoder() : undefined;
    const _TE = typeof TextEncoder === 'function' ? new TextEncoder() : undefined;
    const b64ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const b64chs = Array.prototype.slice.call(b64ch);
    ((a) => {
        let tab = {};
        a.forEach((c, i) => tab[c] = i);
        return tab;
    })(b64chs);
    const _fromCC = String.fromCharCode.bind(String);
    typeof Uint8Array.from === 'function'
        ? Uint8Array.from.bind(Uint8Array)
        : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
    const _mkUriSafe = (src) => src
        .replace(/=/g, '').replace(/[+\/]/g, (m0) => m0 == '+' ? '-' : '_');
    /**
     * polyfill version of `btoa`
     */
    const btoaPolyfill = (bin) => {
        // console.log('polyfilled');
        let u32, c0, c1, c2, asc = '';
        const pad = bin.length % 3;
        for (let i = 0; i < bin.length;) {
            if ((c0 = bin.charCodeAt(i++)) > 255 ||
                (c1 = bin.charCodeAt(i++)) > 255 ||
                (c2 = bin.charCodeAt(i++)) > 255)
                throw new TypeError('invalid character found');
            u32 = (c0 << 16) | (c1 << 8) | c2;
            asc += b64chs[u32 >> 18 & 63]
                + b64chs[u32 >> 12 & 63]
                + b64chs[u32 >> 6 & 63]
                + b64chs[u32 & 63];
        }
        return pad ? asc.slice(0, pad - 3) + "===".substring(pad) : asc;
    };
    /**
     * does what `window.btoa` of web browsers do.
     * @param {String} bin binary string
     * @returns {string} Base64-encoded string
     */
    const _btoa = _hasbtoa ? (bin) => btoa(bin)
        : _hasBuffer ? (bin) => Buffer.from(bin, 'binary').toString('base64')
            : btoaPolyfill;
    const _fromUint8Array = _hasBuffer
        ? (u8a) => Buffer.from(u8a).toString('base64')
        : (u8a) => {
            // cf. https://stackoverflow.com/questions/12710001/how-to-convert-uint8-array-to-base64-encoded-string/12713326#12713326
            const maxargs = 0x1000;
            let strs = [];
            for (let i = 0, l = u8a.length; i < l; i += maxargs) {
                strs.push(_fromCC.apply(null, u8a.subarray(i, i + maxargs)));
            }
            return _btoa(strs.join(''));
        };
    // This trick is found broken https://github.com/dankogai/js-base64/issues/130
    // const utob = (src: string) => unescape(encodeURIComponent(src));
    // reverting good old fationed regexp
    const cb_utob = (c) => {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (_fromCC(0xc0 | (cc >>> 6))
                    + _fromCC(0x80 | (cc & 0x3f)))
                    : (_fromCC(0xe0 | ((cc >>> 12) & 0x0f))
                        + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                        + _fromCC(0x80 | (cc & 0x3f)));
        }
        else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (_fromCC(0xf0 | ((cc >>> 18) & 0x07))
                + _fromCC(0x80 | ((cc >>> 12) & 0x3f))
                + _fromCC(0x80 | ((cc >>> 6) & 0x3f))
                + _fromCC(0x80 | (cc & 0x3f)));
        }
    };
    const re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    /**
     * @deprecated should have been internal use only.
     * @param {string} src UTF-8 string
     * @returns {string} UTF-16 string
     */
    const utob = (u) => u.replace(re_utob, cb_utob);
    //
    const _encode = _hasBuffer
        ? (s) => Buffer.from(s, 'utf8').toString('base64')
        : _TE
            ? (s) => _fromUint8Array(_TE.encode(s))
            : (s) => _btoa(utob(s));
    /**
     * converts a UTF-8-encoded string to a Base64 string.
     * @param {boolean} [urlsafe] if `true` make the result URL-safe
     * @returns {string} Base64 string
     */
    const encode = (src, urlsafe = false) => urlsafe
        ? _mkUriSafe(_encode(src))
        : _encode(src);

    class ManInTheMiddle {
        get message() {
            return "Man in the Middle attack";
        }
        get name() {
            return "ManInTheMiddle";
        }
    }

    class OAuthError {
        message;
        constructor(message) {
            this.message = message;
        }
        get name() {
            return "OAuthError";
        }
    }

    class Unauthenticated {
        get message() {
            return "Unauthenticated";
        }
        get name() {
            return "Unauthenticated";
        }
    }

    /**
     * @internal
     */
    class BaseGrant {
        integration;
        tokenUri;
        constructor(integration, tokenUri) {
            this.integration = integration;
            this.tokenUri = tokenUri;
        }
        getToken(params, headers = {}) {
            const requestHeader = new Headers(headers);
            requestHeader.set("content-type", "application/json");
            return this.integration.fetch(this.tokenUri, {
                method: "post",
                body: JSON.stringify(params),
                headers: requestHeader
            })
                .then((response) => response.json())
                .then(async (response) => {
                if (Object.keys(response).includes("error")) {
                    (await this.integration.tokenStorage()).set(null);
                    throw new OAuthError(response.error_description);
                }
                else {
                    (await this.integration.tokenStorage()).set(response);
                }
                return response;
            });
        }
        onRequest() {
            return Promise.resolve(true);
        }
        async onUnauthenticated(scopes) {
            const tries = parseInt(await this.integration.getFromTemporary("svelte-oauth-tries") || "0");
            if (tries > 5) {
                throw new Unauthenticated();
            }
            await this.integration.saveInTemporary("svelte-oauth-tries", (tries + 1) + "");
            return null;
        }
    }

    class AuthorizationCode extends BaseGrant {
        clientId;
        clientSecret;
        postLoginRedirectUri;
        authorizationRedirectUri;
        authorizationUri;
        credentialMode;
        /**
         * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
         * @param {string} clientId The OAuth2 Client Id
         * @param {string} clientSecret The OAuth2 Client Secret
         * @param {string} postLoginRedirectUri The application URI to go when the user is authenticated.
         * @param {string} tokenUri The Auth Server URI where to get the access token.
         * @param {string} authorizationUri The Auth Server URI where to go for authentication.
         * @param {string} authorizationRedirectUri The application URI to go back from the Auth Server
         * @param {"request"|"header"} credentialMode Where to put credential (Client Id and Client Secret)
         */
        constructor(integration, clientId, clientSecret, postLoginRedirectUri, tokenUri, authorizationUri, authorizationRedirectUri, credentialMode = "request") {
            super(integration, tokenUri);
            this.authorizationRedirectUri = authorizationRedirectUri;
            this.authorizationUri = authorizationUri;
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.postLoginRedirectUri = postLoginRedirectUri;
            this.credentialMode = credentialMode;
        }
        async onRequest() {
            const params = await this.integration.query();
            if (params.has("code") && params.has("state")) {
                const state = params.get("state");
                const code = params.get("code");
                if (state !== (await this.integration.getFromTemporary("svelte-oauth-state"))) {
                    throw new ManInTheMiddle();
                }
                const tokenParams = {
                    grant_type: "authorization_code",
                    code: code,
                    redirect_uri: this.postLoginRedirectUri
                };
                const tokenHeaders = {};
                if (this.credentialMode === "request") {
                    tokenParams["client_id"] = this.clientId;
                    tokenParams["client_secret"] = this.clientSecret;
                }
                else {
                    tokenHeaders["Authorization"] = "Basic " + encode(this.clientId + ":" + this.clientSecret);
                }
                return this.getToken(tokenParams, tokenHeaders).then(async () => {
                    await this.integration.redirect(this.postLoginRedirectUri);
                    return Promise.resolve(true);
                });
            }
            return super.onRequest();
        }
        async onUnauthenticated(scopes) {
            await super.onUnauthenticated(scopes);
            const url = new URL(this.authorizationUri);
            url.searchParams.append("response_type", "code");
            url.searchParams.append("scope", scopes.join(" "));
            url.searchParams.append("client_id", this.clientId);
            url.searchParams.append("state", await this.generateState(scopes));
            url.searchParams.append("redirect_uri", this.authorizationRedirectUri);
            return this.integration.redirect(url.toString());
        }
        async generateState(scopes) {
            const state = ((new Date()).getTime() + scopes.join("_")).split("").sort(() => .5 - Math.random()).join("");
            await this.integration.saveInTemporary("svelte-oauth-state", encode(state));
            return encode(state);
        }
    }

    var sha256$1 = {exports: {}};

    var core = {exports: {}};

    (function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory();
    	}
    }(commonjsGlobal, function () {

    	/**
    	 * CryptoJS core components.
    	 */
    	var CryptoJS = CryptoJS || (function (Math, undefined$1) {
    	    /*
    	     * Local polyfil of Object.create
    	     */
    	    var create = Object.create || (function () {
    	        function F() {}
    	        return function (obj) {
    	            var subtype;

    	            F.prototype = obj;

    	            subtype = new F();

    	            F.prototype = null;

    	            return subtype;
    	        };
    	    }());

    	    /**
    	     * CryptoJS namespace.
    	     */
    	    var C = {};

    	    /**
    	     * Library namespace.
    	     */
    	    var C_lib = C.lib = {};

    	    /**
    	     * Base object for prototypal inheritance.
    	     */
    	    var Base = C_lib.Base = (function () {


    	        return {
    	            /**
    	             * Creates a new object that inherits from this object.
    	             *
    	             * @param {Object} overrides Properties to copy into the new object.
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         field: 'value',
    	             *
    	             *         method: function () {
    	             *         }
    	             *     });
    	             */
    	            extend: function (overrides) {
    	                // Spawn
    	                var subtype = create(this);

    	                // Augment
    	                if (overrides) {
    	                    subtype.mixIn(overrides);
    	                }

    	                // Create default initializer
    	                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
    	                    subtype.init = function () {
    	                        subtype.$super.init.apply(this, arguments);
    	                    };
    	                }

    	                // Initializer's prototype is the subtype object
    	                subtype.init.prototype = subtype;

    	                // Reference supertype
    	                subtype.$super = this;

    	                return subtype;
    	            },

    	            /**
    	             * Extends this object and runs the init method.
    	             * Arguments to create() will be passed to init().
    	             *
    	             * @return {Object} The new object.
    	             *
    	             * @static
    	             *
    	             * @example
    	             *
    	             *     var instance = MyType.create();
    	             */
    	            create: function () {
    	                var instance = this.extend();
    	                instance.init.apply(instance, arguments);

    	                return instance;
    	            },

    	            /**
    	             * Initializes a newly created object.
    	             * Override this method to add some logic when your objects are created.
    	             *
    	             * @example
    	             *
    	             *     var MyType = CryptoJS.lib.Base.extend({
    	             *         init: function () {
    	             *             // ...
    	             *         }
    	             *     });
    	             */
    	            init: function () {
    	            },

    	            /**
    	             * Copies properties into this object.
    	             *
    	             * @param {Object} properties The properties to mix in.
    	             *
    	             * @example
    	             *
    	             *     MyType.mixIn({
    	             *         field: 'value'
    	             *     });
    	             */
    	            mixIn: function (properties) {
    	                for (var propertyName in properties) {
    	                    if (properties.hasOwnProperty(propertyName)) {
    	                        this[propertyName] = properties[propertyName];
    	                    }
    	                }

    	                // IE won't copy toString using the loop above
    	                if (properties.hasOwnProperty('toString')) {
    	                    this.toString = properties.toString;
    	                }
    	            },

    	            /**
    	             * Creates a copy of this object.
    	             *
    	             * @return {Object} The clone.
    	             *
    	             * @example
    	             *
    	             *     var clone = instance.clone();
    	             */
    	            clone: function () {
    	                return this.init.prototype.extend(this);
    	            }
    	        };
    	    }());

    	    /**
    	     * An array of 32-bit words.
    	     *
    	     * @property {Array} words The array of 32-bit words.
    	     * @property {number} sigBytes The number of significant bytes in this word array.
    	     */
    	    var WordArray = C_lib.WordArray = Base.extend({
    	        /**
    	         * Initializes a newly created word array.
    	         *
    	         * @param {Array} words (Optional) An array of 32-bit words.
    	         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.create();
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
    	         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
    	         */
    	        init: function (words, sigBytes) {
    	            words = this.words = words || [];

    	            if (sigBytes != undefined$1) {
    	                this.sigBytes = sigBytes;
    	            } else {
    	                this.sigBytes = words.length * 4;
    	            }
    	        },

    	        /**
    	         * Converts this word array to a string.
    	         *
    	         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
    	         *
    	         * @return {string} The stringified word array.
    	         *
    	         * @example
    	         *
    	         *     var string = wordArray + '';
    	         *     var string = wordArray.toString();
    	         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
    	         */
    	        toString: function (encoder) {
    	            return (encoder || Hex).stringify(this);
    	        },

    	        /**
    	         * Concatenates a word array to this word array.
    	         *
    	         * @param {WordArray} wordArray The word array to append.
    	         *
    	         * @return {WordArray} This word array.
    	         *
    	         * @example
    	         *
    	         *     wordArray1.concat(wordArray2);
    	         */
    	        concat: function (wordArray) {
    	            // Shortcuts
    	            var thisWords = this.words;
    	            var thatWords = wordArray.words;
    	            var thisSigBytes = this.sigBytes;
    	            var thatSigBytes = wordArray.sigBytes;

    	            // Clamp excess bits
    	            this.clamp();

    	            // Concat
    	            if (thisSigBytes % 4) {
    	                // Copy one byte at a time
    	                for (var i = 0; i < thatSigBytes; i++) {
    	                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
    	                }
    	            } else {
    	                // Copy one word at a time
    	                for (var i = 0; i < thatSigBytes; i += 4) {
    	                    thisWords[(thisSigBytes + i) >>> 2] = thatWords[i >>> 2];
    	                }
    	            }
    	            this.sigBytes += thatSigBytes;

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Removes insignificant bits.
    	         *
    	         * @example
    	         *
    	         *     wordArray.clamp();
    	         */
    	        clamp: function () {
    	            // Shortcuts
    	            var words = this.words;
    	            var sigBytes = this.sigBytes;

    	            // Clamp
    	            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
    	            words.length = Math.ceil(sigBytes / 4);
    	        },

    	        /**
    	         * Creates a copy of this word array.
    	         *
    	         * @return {WordArray} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = wordArray.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone.words = this.words.slice(0);

    	            return clone;
    	        },

    	        /**
    	         * Creates a word array filled with random bytes.
    	         *
    	         * @param {number} nBytes The number of random bytes to generate.
    	         *
    	         * @return {WordArray} The random word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.lib.WordArray.random(16);
    	         */
    	        random: function (nBytes) {
    	            var words = [];

    	            var r = (function (m_w) {
    	                var m_w = m_w;
    	                var m_z = 0x3ade68b1;
    	                var mask = 0xffffffff;

    	                return function () {
    	                    m_z = (0x9069 * (m_z & 0xFFFF) + (m_z >> 0x10)) & mask;
    	                    m_w = (0x4650 * (m_w & 0xFFFF) + (m_w >> 0x10)) & mask;
    	                    var result = ((m_z << 0x10) + m_w) & mask;
    	                    result /= 0x100000000;
    	                    result += 0.5;
    	                    return result * (Math.random() > .5 ? 1 : -1);
    	                }
    	            });

    	            for (var i = 0, rcache; i < nBytes; i += 4) {
    	                var _r = r((rcache || Math.random()) * 0x100000000);

    	                rcache = _r() * 0x3ade67b7;
    	                words.push((_r() * 0x100000000) | 0);
    	            }

    	            return new WordArray.init(words, nBytes);
    	        }
    	    });

    	    /**
    	     * Encoder namespace.
    	     */
    	    var C_enc = C.enc = {};

    	    /**
    	     * Hex encoding strategy.
    	     */
    	    var Hex = C_enc.Hex = {
    	        /**
    	         * Converts a word array to a hex string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The hex string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var hexChars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                hexChars.push((bite >>> 4).toString(16));
    	                hexChars.push((bite & 0x0f).toString(16));
    	            }

    	            return hexChars.join('');
    	        },

    	        /**
    	         * Converts a hex string to a word array.
    	         *
    	         * @param {string} hexStr The hex string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
    	         */
    	        parse: function (hexStr) {
    	            // Shortcut
    	            var hexStrLength = hexStr.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < hexStrLength; i += 2) {
    	                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
    	            }

    	            return new WordArray.init(words, hexStrLength / 2);
    	        }
    	    };

    	    /**
    	     * Latin1 encoding strategy.
    	     */
    	    var Latin1 = C_enc.Latin1 = {
    	        /**
    	         * Converts a word array to a Latin1 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The Latin1 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;

    	            // Convert
    	            var latin1Chars = [];
    	            for (var i = 0; i < sigBytes; i++) {
    	                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    	                latin1Chars.push(String.fromCharCode(bite));
    	            }

    	            return latin1Chars.join('');
    	        },

    	        /**
    	         * Converts a Latin1 string to a word array.
    	         *
    	         * @param {string} latin1Str The Latin1 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
    	         */
    	        parse: function (latin1Str) {
    	            // Shortcut
    	            var latin1StrLength = latin1Str.length;

    	            // Convert
    	            var words = [];
    	            for (var i = 0; i < latin1StrLength; i++) {
    	                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
    	            }

    	            return new WordArray.init(words, latin1StrLength);
    	        }
    	    };

    	    /**
    	     * UTF-8 encoding strategy.
    	     */
    	    var Utf8 = C_enc.Utf8 = {
    	        /**
    	         * Converts a word array to a UTF-8 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The UTF-8 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            try {
    	                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
    	            } catch (e) {
    	                throw new Error('Malformed UTF-8 data');
    	            }
    	        },

    	        /**
    	         * Converts a UTF-8 string to a word array.
    	         *
    	         * @param {string} utf8Str The UTF-8 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
    	         */
    	        parse: function (utf8Str) {
    	            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
    	        }
    	    };

    	    /**
    	     * Abstract buffered block algorithm template.
    	     *
    	     * The property blockSize must be implemented in a concrete subtype.
    	     *
    	     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
    	     */
    	    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
    	        /**
    	         * Resets this block algorithm's data buffer to its initial state.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm.reset();
    	         */
    	        reset: function () {
    	            // Initial values
    	            this._data = new WordArray.init();
    	            this._nDataBytes = 0;
    	        },

    	        /**
    	         * Adds new data to this block algorithm's buffer.
    	         *
    	         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
    	         *
    	         * @example
    	         *
    	         *     bufferedBlockAlgorithm._append('data');
    	         *     bufferedBlockAlgorithm._append(wordArray);
    	         */
    	        _append: function (data) {
    	            // Convert string to WordArray, else assume WordArray already
    	            if (typeof data == 'string') {
    	                data = Utf8.parse(data);
    	            }

    	            // Append
    	            this._data.concat(data);
    	            this._nDataBytes += data.sigBytes;
    	        },

    	        /**
    	         * Processes available data blocks.
    	         *
    	         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
    	         *
    	         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
    	         *
    	         * @return {WordArray} The processed data.
    	         *
    	         * @example
    	         *
    	         *     var processedData = bufferedBlockAlgorithm._process();
    	         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
    	         */
    	        _process: function (doFlush) {
    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;
    	            var dataSigBytes = data.sigBytes;
    	            var blockSize = this.blockSize;
    	            var blockSizeBytes = blockSize * 4;

    	            // Count blocks ready
    	            var nBlocksReady = dataSigBytes / blockSizeBytes;
    	            if (doFlush) {
    	                // Round up to include partial blocks
    	                nBlocksReady = Math.ceil(nBlocksReady);
    	            } else {
    	                // Round down to include only full blocks,
    	                // less the number of blocks that must remain in the buffer
    	                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
    	            }

    	            // Count words ready
    	            var nWordsReady = nBlocksReady * blockSize;

    	            // Count bytes ready
    	            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

    	            // Process blocks
    	            if (nWordsReady) {
    	                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
    	                    // Perform concrete-algorithm logic
    	                    this._doProcessBlock(dataWords, offset);
    	                }

    	                // Remove processed words
    	                var processedWords = dataWords.splice(0, nWordsReady);
    	                data.sigBytes -= nBytesReady;
    	            }

    	            // Return processed words
    	            return new WordArray.init(processedWords, nBytesReady);
    	        },

    	        /**
    	         * Creates a copy of this object.
    	         *
    	         * @return {Object} The clone.
    	         *
    	         * @example
    	         *
    	         *     var clone = bufferedBlockAlgorithm.clone();
    	         */
    	        clone: function () {
    	            var clone = Base.clone.call(this);
    	            clone._data = this._data.clone();

    	            return clone;
    	        },

    	        _minBufferSize: 0
    	    });

    	    /**
    	     * Abstract hasher template.
    	     *
    	     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
    	     */
    	    C_lib.Hasher = BufferedBlockAlgorithm.extend({
    	        /**
    	         * Configuration options.
    	         */
    	        cfg: Base.extend(),

    	        /**
    	         * Initializes a newly created hasher.
    	         *
    	         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
    	         *
    	         * @example
    	         *
    	         *     var hasher = CryptoJS.algo.SHA256.create();
    	         */
    	        init: function (cfg) {
    	            // Apply config defaults
    	            this.cfg = this.cfg.extend(cfg);

    	            // Set initial values
    	            this.reset();
    	        },

    	        /**
    	         * Resets this hasher to its initial state.
    	         *
    	         * @example
    	         *
    	         *     hasher.reset();
    	         */
    	        reset: function () {
    	            // Reset data buffer
    	            BufferedBlockAlgorithm.reset.call(this);

    	            // Perform concrete-hasher logic
    	            this._doReset();
    	        },

    	        /**
    	         * Updates this hasher with a message.
    	         *
    	         * @param {WordArray|string} messageUpdate The message to append.
    	         *
    	         * @return {Hasher} This hasher.
    	         *
    	         * @example
    	         *
    	         *     hasher.update('message');
    	         *     hasher.update(wordArray);
    	         */
    	        update: function (messageUpdate) {
    	            // Append
    	            this._append(messageUpdate);

    	            // Update the hash
    	            this._process();

    	            // Chainable
    	            return this;
    	        },

    	        /**
    	         * Finalizes the hash computation.
    	         * Note that the finalize operation is effectively a destructive, read-once operation.
    	         *
    	         * @param {WordArray|string} messageUpdate (Optional) A final message update.
    	         *
    	         * @return {WordArray} The hash.
    	         *
    	         * @example
    	         *
    	         *     var hash = hasher.finalize();
    	         *     var hash = hasher.finalize('message');
    	         *     var hash = hasher.finalize(wordArray);
    	         */
    	        finalize: function (messageUpdate) {
    	            // Final message update
    	            if (messageUpdate) {
    	                this._append(messageUpdate);
    	            }

    	            // Perform concrete-hasher logic
    	            var hash = this._doFinalize();

    	            return hash;
    	        },

    	        blockSize: 512/32,

    	        /**
    	         * Creates a shortcut function to a hasher's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to create a helper for.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHelper: function (hasher) {
    	            return function (message, cfg) {
    	                return new hasher.init(cfg).finalize(message);
    	            };
    	        },

    	        /**
    	         * Creates a shortcut function to the HMAC's object interface.
    	         *
    	         * @param {Hasher} hasher The hasher to use in this HMAC helper.
    	         *
    	         * @return {Function} The shortcut function.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
    	         */
    	        _createHmacHelper: function (hasher) {
    	            return function (message, key) {
    	                return new C_algo.HMAC.init(hasher, key).finalize(message);
    	            };
    	        }
    	    });

    	    /**
    	     * Algorithm namespace.
    	     */
    	    var C_algo = C.algo = {};

    	    return C;
    	}(Math));


    	return CryptoJS;

    }));
    }(core));

    (function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory(core.exports);
    	}
    }(commonjsGlobal, function (CryptoJS) {

    	(function (Math) {
    	    // Shortcuts
    	    var C = CryptoJS;
    	    var C_lib = C.lib;
    	    var WordArray = C_lib.WordArray;
    	    var Hasher = C_lib.Hasher;
    	    var C_algo = C.algo;

    	    // Initialization and round constants tables
    	    var H = [];
    	    var K = [];

    	    // Compute constants
    	    (function () {
    	        function isPrime(n) {
    	            var sqrtN = Math.sqrt(n);
    	            for (var factor = 2; factor <= sqrtN; factor++) {
    	                if (!(n % factor)) {
    	                    return false;
    	                }
    	            }

    	            return true;
    	        }

    	        function getFractionalBits(n) {
    	            return ((n - (n | 0)) * 0x100000000) | 0;
    	        }

    	        var n = 2;
    	        var nPrime = 0;
    	        while (nPrime < 64) {
    	            if (isPrime(n)) {
    	                if (nPrime < 8) {
    	                    H[nPrime] = getFractionalBits(Math.pow(n, 1 / 2));
    	                }
    	                K[nPrime] = getFractionalBits(Math.pow(n, 1 / 3));

    	                nPrime++;
    	            }

    	            n++;
    	        }
    	    }());

    	    // Reusable object
    	    var W = [];

    	    /**
    	     * SHA-256 hash algorithm.
    	     */
    	    var SHA256 = C_algo.SHA256 = Hasher.extend({
    	        _doReset: function () {
    	            this._hash = new WordArray.init(H.slice(0));
    	        },

    	        _doProcessBlock: function (M, offset) {
    	            // Shortcut
    	            var H = this._hash.words;

    	            // Working variables
    	            var a = H[0];
    	            var b = H[1];
    	            var c = H[2];
    	            var d = H[3];
    	            var e = H[4];
    	            var f = H[5];
    	            var g = H[6];
    	            var h = H[7];

    	            // Computation
    	            for (var i = 0; i < 64; i++) {
    	                if (i < 16) {
    	                    W[i] = M[offset + i] | 0;
    	                } else {
    	                    var gamma0x = W[i - 15];
    	                    var gamma0  = ((gamma0x << 25) | (gamma0x >>> 7))  ^
    	                                  ((gamma0x << 14) | (gamma0x >>> 18)) ^
    	                                   (gamma0x >>> 3);

    	                    var gamma1x = W[i - 2];
    	                    var gamma1  = ((gamma1x << 15) | (gamma1x >>> 17)) ^
    	                                  ((gamma1x << 13) | (gamma1x >>> 19)) ^
    	                                   (gamma1x >>> 10);

    	                    W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16];
    	                }

    	                var ch  = (e & f) ^ (~e & g);
    	                var maj = (a & b) ^ (a & c) ^ (b & c);

    	                var sigma0 = ((a << 30) | (a >>> 2)) ^ ((a << 19) | (a >>> 13)) ^ ((a << 10) | (a >>> 22));
    	                var sigma1 = ((e << 26) | (e >>> 6)) ^ ((e << 21) | (e >>> 11)) ^ ((e << 7)  | (e >>> 25));

    	                var t1 = h + sigma1 + ch + K[i] + W[i];
    	                var t2 = sigma0 + maj;

    	                h = g;
    	                g = f;
    	                f = e;
    	                e = (d + t1) | 0;
    	                d = c;
    	                c = b;
    	                b = a;
    	                a = (t1 + t2) | 0;
    	            }

    	            // Intermediate hash value
    	            H[0] = (H[0] + a) | 0;
    	            H[1] = (H[1] + b) | 0;
    	            H[2] = (H[2] + c) | 0;
    	            H[3] = (H[3] + d) | 0;
    	            H[4] = (H[4] + e) | 0;
    	            H[5] = (H[5] + f) | 0;
    	            H[6] = (H[6] + g) | 0;
    	            H[7] = (H[7] + h) | 0;
    	        },

    	        _doFinalize: function () {
    	            // Shortcuts
    	            var data = this._data;
    	            var dataWords = data.words;

    	            var nBitsTotal = this._nDataBytes * 8;
    	            var nBitsLeft = data.sigBytes * 8;

    	            // Add padding
    	            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 14] = Math.floor(nBitsTotal / 0x100000000);
    	            dataWords[(((nBitsLeft + 64) >>> 9) << 4) + 15] = nBitsTotal;
    	            data.sigBytes = dataWords.length * 4;

    	            // Hash final blocks
    	            this._process();

    	            // Return final computed hash
    	            return this._hash;
    	        },

    	        clone: function () {
    	            var clone = Hasher.clone.call(this);
    	            clone._hash = this._hash.clone();

    	            return clone;
    	        }
    	    });

    	    /**
    	     * Shortcut function to the hasher's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     *
    	     * @return {WordArray} The hash.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hash = CryptoJS.SHA256('message');
    	     *     var hash = CryptoJS.SHA256(wordArray);
    	     */
    	    C.SHA256 = Hasher._createHelper(SHA256);

    	    /**
    	     * Shortcut function to the HMAC's object interface.
    	     *
    	     * @param {WordArray|string} message The message to hash.
    	     * @param {WordArray|string} key The secret key.
    	     *
    	     * @return {WordArray} The HMAC.
    	     *
    	     * @static
    	     *
    	     * @example
    	     *
    	     *     var hmac = CryptoJS.HmacSHA256(message, key);
    	     */
    	    C.HmacSHA256 = Hasher._createHmacHelper(SHA256);
    	}(Math));


    	return CryptoJS.SHA256;

    }));
    }(sha256$1));

    var encBase64 = {exports: {}};

    (function (module, exports) {
    (function (root, factory) {
    	{
    		// CommonJS
    		module.exports = factory(core.exports);
    	}
    }(commonjsGlobal, function (CryptoJS) {

    	(function () {
    	    // Shortcuts
    	    var C = CryptoJS;
    	    var C_lib = C.lib;
    	    var WordArray = C_lib.WordArray;
    	    var C_enc = C.enc;

    	    /**
    	     * Base64 encoding strategy.
    	     */
    	    C_enc.Base64 = {
    	        /**
    	         * Converts a word array to a Base64 string.
    	         *
    	         * @param {WordArray} wordArray The word array.
    	         *
    	         * @return {string} The Base64 string.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var base64String = CryptoJS.enc.Base64.stringify(wordArray);
    	         */
    	        stringify: function (wordArray) {
    	            // Shortcuts
    	            var words = wordArray.words;
    	            var sigBytes = wordArray.sigBytes;
    	            var map = this._map;

    	            // Clamp excess bits
    	            wordArray.clamp();

    	            // Convert
    	            var base64Chars = [];
    	            for (var i = 0; i < sigBytes; i += 3) {
    	                var byte1 = (words[i >>> 2]       >>> (24 - (i % 4) * 8))       & 0xff;
    	                var byte2 = (words[(i + 1) >>> 2] >>> (24 - ((i + 1) % 4) * 8)) & 0xff;
    	                var byte3 = (words[(i + 2) >>> 2] >>> (24 - ((i + 2) % 4) * 8)) & 0xff;

    	                var triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    	                for (var j = 0; (j < 4) && (i + j * 0.75 < sigBytes); j++) {
    	                    base64Chars.push(map.charAt((triplet >>> (6 * (3 - j))) & 0x3f));
    	                }
    	            }

    	            // Add padding
    	            var paddingChar = map.charAt(64);
    	            if (paddingChar) {
    	                while (base64Chars.length % 4) {
    	                    base64Chars.push(paddingChar);
    	                }
    	            }

    	            return base64Chars.join('');
    	        },

    	        /**
    	         * Converts a Base64 string to a word array.
    	         *
    	         * @param {string} base64Str The Base64 string.
    	         *
    	         * @return {WordArray} The word array.
    	         *
    	         * @static
    	         *
    	         * @example
    	         *
    	         *     var wordArray = CryptoJS.enc.Base64.parse(base64String);
    	         */
    	        parse: function (base64Str) {
    	            // Shortcuts
    	            var base64StrLength = base64Str.length;
    	            var map = this._map;
    	            var reverseMap = this._reverseMap;

    	            if (!reverseMap) {
    	                    reverseMap = this._reverseMap = [];
    	                    for (var j = 0; j < map.length; j++) {
    	                        reverseMap[map.charCodeAt(j)] = j;
    	                    }
    	            }

    	            // Ignore padding
    	            var paddingChar = map.charAt(64);
    	            if (paddingChar) {
    	                var paddingIndex = base64Str.indexOf(paddingChar);
    	                if (paddingIndex !== -1) {
    	                    base64StrLength = paddingIndex;
    	                }
    	            }

    	            // Convert
    	            return parseLoop(base64Str, base64StrLength, reverseMap);

    	        },

    	        _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
    	    };

    	    function parseLoop(base64Str, base64StrLength, reverseMap) {
    	      var words = [];
    	      var nBytes = 0;
    	      for (var i = 0; i < base64StrLength; i++) {
    	          if (i % 4) {
    	              var bits1 = reverseMap[base64Str.charCodeAt(i - 1)] << ((i % 4) * 2);
    	              var bits2 = reverseMap[base64Str.charCodeAt(i)] >>> (6 - (i % 4) * 2);
    	              words[nBytes >>> 2] |= (bits1 | bits2) << (24 - (nBytes % 4) * 8);
    	              nBytes++;
    	          }
    	      }
    	      return WordArray.create(words, nBytes);
    	    }
    	}());


    	return CryptoJS.enc.Base64;

    }));
    }(encBase64));

    var secureRandom$1 = {exports: {}};

    (function (module) {
    !function(globals){

    //*** UMD BEGIN
    if (module.exports) { //CommonJS
      module.exports = secureRandom;
    } else { //script / browser
      globals.secureRandom = secureRandom;
    }
    //*** UMD END

    //options.type is the only valid option
    function secureRandom(count, options) {
      options = options || {type: 'Array'};
      //we check for process.pid to prevent browserify from tricking us
      if (
        typeof process != 'undefined'
        && typeof process.pid == 'number'
        && process.versions
        && process.versions.node
      ) {
        return nodeRandom(count, options)
      } else {
        var crypto = window.crypto || window.msCrypto;
        if (!crypto) throw new Error("Your browser does not support window.crypto.")
        return browserRandom(count, options)
      }
    }

    function nodeRandom(count, options) {
      var crypto = require('crypto');
      var buf = crypto.randomBytes(count);

      switch (options.type) {
        case 'Array':
          return [].slice.call(buf)
        case 'Buffer':
          return buf
        case 'Uint8Array':
          var arr = new Uint8Array(count);
          for (var i = 0; i < count; ++i) { arr[i] = buf.readUInt8(i); }
          return arr
        default:
          throw new Error(options.type + " is unsupported.")
      }
    }

    function browserRandom(count, options) {
      var nativeArr = new Uint8Array(count);
      var crypto = window.crypto || window.msCrypto;
      crypto.getRandomValues(nativeArr);

      switch (options.type) {
        case 'Array':
          return [].slice.call(nativeArr)
        case 'Buffer':
          try { var b = new Buffer(1); } catch(e) { throw new Error('Buffer not supported in this environment. Use Node.js or Browserify for browser support.')}
          return new Buffer(nativeArr)
        case 'Uint8Array':
          return nativeArr
        default:
          throw new Error(options.type + " is unsupported.")
      }
    }

    secureRandom.randomArray = function(byteCount) {
      return secureRandom(byteCount, {type: 'Array'})
    };

    secureRandom.randomUint8Array = function(byteCount) {
      return secureRandom(byteCount, {type: 'Uint8Array'})
    };

    secureRandom.randomBuffer = function(byteCount) {
      return secureRandom(byteCount, {type: 'Buffer'})
    };


    }(commonjsGlobal);
    }(secureRandom$1));

    var sha256 = sha256$1.exports;
    var base64 = encBase64.exports;
    var secureRandom = secureRandom$1.exports;
    var mask = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~";
    function random(size) {
        var value = "";
        var bytes = secureRandom(size);
        var scale = 256 / mask.length; // 256 = 0 to 0xFF (randomBytes)
        for (var i = 0; i < size; i++) {
            value += mask.charAt(Math.floor(bytes[i] / scale));
        }
        return value;
    }
    function hash(str) {
        return base64.stringify(sha256(str));
    }
    function base64url(str) {
        return str
            .replace(/=/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
    }
    function createVerifier(length) {
        if (length === void 0) { length = 128; }
        if (length < 43 || length > 128) {
            throw new Error("expected length " + length + " between 43 and 128");
        }
        return random(length);
    }
    function createChallenge(verifier) {
        return base64url(hash(verifier));
    }
    function create(length) {
        if (length === void 0) { length = 128; }
        var verifier = createVerifier(length);
        var challenge = createChallenge(verifier);
        return {
            codeVerifier: verifier,
            codeChallenge: challenge
        };
    }
    var create_1 = create;

    class AuthorizationCodePKCE extends BaseGrant {
        clientId;
        postLoginRedirectUri;
        authorizationRedirectUri;
        authorizationUri;
        /**
         * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
         * @param {string} clientId The OAuth2 Client Id
         * @param {string} postLoginRedirectUri The application URI to go when the user is authenticated.
         * @param {string} tokenUri The Auth Server URI where to get the access token.
         * @param {string} authorizationUri The Auth Server URI where to go for authentication.
         * @param {string} authorizationRedirectUri The application URI to go back from the Auth Server
         */
        constructor(integration, clientId, postLoginRedirectUri, tokenUri, authorizationUri, authorizationRedirectUri) {
            super(integration, tokenUri);
            this.authorizationRedirectUri = authorizationRedirectUri;
            this.authorizationUri = authorizationUri;
            this.clientId = clientId;
            this.postLoginRedirectUri = postLoginRedirectUri;
        }
        async onRequest() {
            const params = await this.integration.query();
            if (params.has("code") && params.has("state")) {
                const state = params.get("state");
                const code = params.get("code");
                if (state !== (await this.integration.getFromTemporary("svelte-oauth-state"))) {
                    return Promise.reject(new ManInTheMiddle());
                }
                return this.getToken({
                    grant_type: "authorization_code",
                    code: code,
                    client_id: this.clientId,
                    redirect_uri: this.postLoginRedirectUri,
                    code_verifier: await this.integration.getFromTemporary("svelte-oauth-code-verifier")
                }).then(async () => {
                    await this.integration.redirect(this.postLoginRedirectUri);
                    return Promise.resolve(true);
                });
            }
            return super.onRequest();
        }
        async onUnauthenticated(scopes) {
            await super.onUnauthenticated(scopes);
            const url = new URL(this.authorizationUri);
            url.searchParams.append("response_type", "code");
            url.searchParams.append("scope", scopes.join(" "));
            url.searchParams.append("client_id", this.clientId);
            url.searchParams.append("state", await this.generateState(scopes));
            url.searchParams.append("redirect_uri", this.authorizationRedirectUri);
            url.searchParams.append("code_challenge", await this.generateCodeChallenge());
            url.searchParams.append("code_challenge_method", "S256");
            return this.integration.redirect(url.toString());
        }
        async generateState(scopes) {
            const state = ((new Date()).getTime() + scopes.join("_")).split("").sort(() => .5 - Math.random()).join("");
            await this.integration.saveInTemporary("svelte-oauth-state", encode(state));
            return encode(state);
        }
        async generateCodeChallenge() {
            const { codeVerifier, codeChallenge } = create_1(128);
            await this.integration.saveInTemporary("svelte-oauth-code-verifier", codeVerifier);
            return codeChallenge;
        }
    }

    class ClientCredentials extends BaseGrant {
        postAuthenticateUri;
        clientId;
        clientSecret;
        credentialMode = "request";
        /**
         * @param {ContextStrategy} integration The context strategy to use (How the auth integrate with the app).
         * @param {string} clientId The OAuth2 Client Id
         * @param {string} clientSecret The OAuth2 Client Secret
         * @param {string} tokenUri The Auth Server URI where to get the access token.
         * @param {string} postAuthenticateUri The application URI to go when the user is authenticated.
         * @param {"request"|"header"} credentialMode Where to put credential (Client Id and Client Secret)
         */
        constructor(integration, tokenUri, postAuthenticateUri, clientId, clientSecret, credentialMode = "request") {
            super(integration, tokenUri);
            this.clientId = clientId;
            this.clientSecret = clientSecret;
            this.credentialMode = credentialMode;
            this.postAuthenticateUri = postAuthenticateUri;
        }
        async onUnauthenticated(scopes) {
            await super.onUnauthenticated(scopes);
            const headers = {};
            const params = {
                "response_type": "client_credentials",
                "scope": scopes.join(" "),
            };
            if (this.credentialMode === "request") {
                params["client_id"] = this.clientId;
                params["client_secret"] = this.clientSecret;
            }
            else {
                headers["Authorization"] = "Basic " + encode(this.clientId + ":" + this.clientSecret);
            }
            await this.getToken(params, headers);
            return;
        }
    }

    exports.AuthorizationCode = AuthorizationCode;
    exports.AuthorizationCodePKCE = AuthorizationCodePKCE;
    exports.ClientCredentials = ClientCredentials;
    exports.addAuthHeader = addAuthHeader;
    exports.browserStrategy = browserStrategy;
    exports["default"] = Component;
    exports.init = init$1;
    exports.isAuthorized = isAuthorized;
    exports.runOAuth2Process = runOAuth2Process;
    exports.setCookieName = setCookieName;
    exports.svelteKitStrategy = svelteKitStrategy;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
