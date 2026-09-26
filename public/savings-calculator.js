/*
 * The savings calculator on /ynab-pricing (on /ynab-alternative until 13.09.2026).
 *
 * A file in public/ rather than an inline script, so the site's
 * Content-Security-Policy can stay `script-src 'self'` with no 'unsafe-inline'
 * and no per-build hash. It is the only script on the site.
 *
 * It holds no prices. Every number comes out of data attributes that the page
 * renders from src/consts.ts, so there is one place a price lives and it is
 * not this file. If the attributes are missing the script does nothing and
 * leaves the server-rendered figures alone — which are correct, just not
 * adjustable.
 *
 * Nothing here talks to a network. There is nothing to send and nowhere to
 * send it: SPEC §9 requires the calculator to work on the client.
 *
 * FOUR LANGUAGES, ONE FILE. The currency, the number format and both forms of
 * the word "years" arrive in data attributes too, because they belong to the
 * page's storefront rather than to this script: the German page adds up euros
 * and the Japanese page yen, and yen has no cents. Nothing below knows which
 * language it is running in, which is the point — a language this file has
 * never heard of works as long as the page fills the attributes.
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-calculator]');
  if (!root) return;

  var input = root.querySelector('[data-years-input]');
  var output = {
    years: root.querySelectorAll('[data-out-years]'),
    over: root.querySelectorAll('[data-out-over]'),
    difference: root.querySelectorAll('[data-out-difference]'),
    annual: root.querySelectorAll('[data-out-annual]'),
    monthly: root.querySelectorAll('[data-out-monthly]'),
    once: root.querySelectorAll('[data-out-once]'),
    saved: root.querySelectorAll('[data-out-saved]'),
  };
  if (!input) return;

  var rates = {
    annual: Number(root.dataset.annual),
    monthly: Number(root.dataset.monthly),
    once: Number(root.dataset.once),
  };
  if (!isFinite(rates.annual) || !isFinite(rates.monthly) || !isFinite(rates.once)) {
    return;
  }

  var money = new Intl.NumberFormat(root.dataset.intl || 'en-US', {
    style: 'currency',
    currency: root.dataset.currency || 'USD',
  });

  // Intl writes yen with the fullwidth ￥; Apple and every other price on the
  // page use ¥. One currency has to look like one currency.
  function format(amount) {
    return money.format(amount).replace(/\uffe5/g, '\u00a5');
  }

  function fill(template, values) {
    return String(template || '').replace(/\{(\w+)\}/g, function (whole, name) {
      return Object.prototype.hasOwnProperty.call(values, name)
        ? values[name]
        : whole;
    });
  }

  function put(nodes, text) {
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  function render() {
    var years = Number(input.value);
    if (!isFinite(years) || years < 1) years = 1;

    var annual = rates.annual * years;

    var label =
      years === 1
        ? root.dataset.yearOne || '1 year'
        : fill(root.dataset.yearMany || '{n} years', { n: years });

    put(output.years, label);
    put(output.over, fill(root.dataset.over, { years: label }));
    put(output.difference, fill(root.dataset.difference, { years: label }));
    put(output.annual, format(annual));
    put(output.monthly, format(rates.monthly * 12 * years));
    put(output.once, format(rates.once));
    put(output.saved, format(annual - rates.once));
  }

  // The slider is usable without this, and the page is readable without the
  // slider; this only makes the figures follow it.
  input.addEventListener('input', render);
  root.removeAttribute('data-static');
  render();
})();
