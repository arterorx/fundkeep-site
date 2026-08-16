/*
 * The savings calculator on /ynab-alternative.
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
 */
(function () {
  'use strict';

  var root = document.querySelector('[data-calculator]');
  if (!root) return;

  var input = root.querySelector('[data-years-input]');
  var output = {
    years: root.querySelectorAll('[data-out-years]'),
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

  var money = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  function put(nodes, text) {
    for (var i = 0; i < nodes.length; i++) nodes[i].textContent = text;
  }

  function render() {
    var years = Number(input.value);
    if (!isFinite(years) || years < 1) years = 1;

    var annual = rates.annual * years;

    put(output.years, years === 1 ? '1 year' : years + ' years');
    put(output.annual, money.format(annual));
    put(output.monthly, money.format(rates.monthly * 12 * years));
    put(output.once, money.format(rates.once));
    put(output.saved, money.format(annual - rates.once));
  }

  // The slider is usable without this, and the page is readable without the
  // slider; this only makes the figures follow it.
  input.addEventListener('input', render);
  root.removeAttribute('data-static');
  render();
})();
