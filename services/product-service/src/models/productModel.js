const { pool } = require('../config/db');

const SORT_MAP = {
  price_asc: 'final_price ASC',
  price_desc: 'final_price DESC',
  rating: 'p.rating DESC, p.rating_count DESC',
  newest: 'p.created_at DESC',
  name_asc: 'p.name ASC',
};

const BASE_SELECT = `
  SELECT p.id, p.category_id, c.name AS category_name, c.slug AS category_slug,
         p.name, p.slug, p.description, p.brand, p.price, p.discount_percent,
         ROUND(p.price * (1 - p.discount_percent / 100), 2) AS final_price,
         p.image_url, p.rating, p.rating_count, p.stock_quantity,
         p.specifications, p.is_featured, p.is_new_arrival, p.status,
         p.created_at, p.updated_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

/**
 * Lists products with optional search, category, price range, and sort,
 * plus pagination. This single flexible query backs both GET /api/products
 * (with query params) and GET /api/products/search.
 */
const findAll = async ({
  search,
  categorySlug,
  minPrice,
  maxPrice,
  featured,
  newArrival,
  sort = 'newest',
  page = 1,
  limit = 12,
}) => {
  const where = ["p.status = 'active'"];
  const params = [];

  if (search) {
    where.push('MATCH(p.name, p.description, p.brand) AGAINST (? IN NATURAL LANGUAGE MODE)');
    params.push(search);
  }
  if (categorySlug) {
    where.push('c.slug = ?');
    params.push(categorySlug);
  }
  if (minPrice !== undefined && minPrice !== null && minPrice !== '') {
    where.push('p.price * (1 - p.discount_percent / 100) >= ?');
    params.push(Number(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== '') {
    where.push('p.price * (1 - p.discount_percent / 100) <= ?');
    params.push(Number(maxPrice));
  }
  if (featured === 'true' || featured === true) {
    where.push('p.is_featured = 1');
  }
  if (newArrival === 'true' || newArrival === true) {
    where.push('p.is_new_arrival = 1');
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderSql = SORT_MAP[sort] || SORT_MAP.newest;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 60);
  const offset = (pageNum - 1) * limitNum;

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id ${whereSql}`,
    params
  );

  return { rows, total: countRows[0].total, page: pageNum, limit: limitNum };
};

const findById = async (id) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE p.id = ? LIMIT 1`, [id]);
  return rows[0] || null;
};

const findBySlug = async (slug) => {
  const [rows] = await pool.query(`${BASE_SELECT} WHERE p.slug = ? LIMIT 1`, [slug]);
  return rows[0] || null;
};

/** Related products: same category, excluding the product itself. */
const findRelated = async (productId, categoryId, limitNum = 4) => {
  const [rows] = await pool.query(
    `${BASE_SELECT} WHERE p.category_id = ? AND p.id != ? AND p.status = 'active' ORDER BY p.rating DESC LIMIT ?`,
    [categoryId, productId, limitNum]
  );
  return rows;
};

const create = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO products
       (category_id, name, slug, description, brand, price, discount_percent, image_url,
        stock_quantity, specifications, is_featured, is_new_arrival)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.categoryId, data.name, data.slug, data.description || null, data.brand || null,
      data.price, data.discountPercent || 0, data.imageUrl, data.stockQuantity || 0,
      data.specifications ? JSON.stringify(data.specifications) : null,
      data.isFeatured ? 1 : 0, data.isNewArrival ? 1 : 0,
    ]
  );
  return findById(result.insertId);
};

const update = async (id, data) => {
  const fields = [];
  const params = [];
  const map = {
    categoryId: 'category_id', name: 'name', slug: 'slug', description: 'description',
    brand: 'brand', price: 'price', discountPercent: 'discount_percent', imageUrl: 'image_url',
    stockQuantity: 'stock_quantity', isFeatured: 'is_featured', isNewArrival: 'is_new_arrival',
  };
  Object.entries(map).forEach(([key, column]) => {
    if (data[key] !== undefined) {
      fields.push(`${column} = ?`);
      params.push(data[key]);
    }
  });
  if (data.specifications !== undefined) {
    fields.push('specifications = ?');
    params.push(JSON.stringify(data.specifications));
  }
  if (fields.length === 0) return findById(id);

  params.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);
  return findById(id);
};

const remove = async (id) => {
  const [result] = await pool.query("UPDATE products SET status = 'discontinued' WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

/**
 * Atomically decrements stock, refusing to go negative. Used by
 * order-service when an order is placed. Returns the number of rows
 * affected - 0 means insufficient stock (the WHERE clause blocked it).
 */
const decrementStock = async (id, quantity) => {
  const [result] = await pool.query(
    'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ? AND stock_quantity >= ?',
    [quantity, id, quantity]
  );
  return result.affectedRows > 0;
};

const incrementStock = async (id, quantity) => {
  await pool.query('UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?', [quantity, id]);
};

module.exports = {
  findAll,
  findById,
  findBySlug,
  findRelated,
  create,
  update,
  remove,
  decrementStock,
  incrementStock,
};
