const slugify = require('slugify');

/** Generates a URL-safe slug from a product name, e.g. "Nimbus 6" -> "nimbus-6". */
const toSlug = (text) => slugify(text, { lower: true, strict: true });

module.exports = toSlug;
