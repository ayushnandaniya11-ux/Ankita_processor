const fs = require('fs');
const path = require('path');
const http = require('http');

const API_BASE = 'http://localhost:3333/api/v1';

async function makeRequest(method, urlPath, headers = {}, body = null) {
  const cleanPath = urlPath.startsWith('/') ? urlPath.slice(1) : urlPath;
  const url = new URL('http://localhost:3333/api/v1/' + cleanPath);

  let bodyBuffer = null;
  const finalHeaders = { ...headers };

  if (body) {
    if (Buffer.isBuffer(body)) {
      bodyBuffer = body;
    } else if (typeof body === 'string') {
      bodyBuffer = Buffer.from(body);
    } else {
      bodyBuffer = Buffer.from(JSON.stringify(body));
      if (!finalHeaders['Content-Type']) {
        finalHeaders['Content-Type'] = 'application/json';
      }
    }
    finalHeaders['Content-Length'] = bodyBuffer.length;
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: finalHeaders,
    };

    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString();
        let parsed = null;
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = raw;
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed,
          raw,
        });
      });
    });

    req.on('error', reject);

    if (bodyBuffer) {
      req.write(bodyBuffer);
    }
    req.end();
  });
}

function createMultipartFormData(fields, files) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const parts = [];

  for (const [key, value] of Object.entries(fields)) {
    parts.push(
      `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
    );
  }

  for (const file of files) {
    const fileContent = fs.readFileSync(file.path);
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="${file.fieldname}"; filename="${file.filename}"\r\nContent-Type: ${file.mimetype || 'image/png'}\r\n\r\n`;
    parts.push(Buffer.from(header, 'binary'));
    parts.push(fileContent);
    parts.push(Buffer.from('\r\n', 'binary'));
  }

  parts.push(Buffer.from(`--${boundary}--\r\n`, 'binary'));

  const totalLength = parts.reduce((acc, part) => acc + (Buffer.isBuffer(part) ? part.length : Buffer.byteLength(part)), 0);
  const body = Buffer.concat(parts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p, 'binary')));

  return {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': totalLength,
    },
    body,
  };
}

async function runTest() {
  console.log('================================================================');
  console.log('STARTING END-TO-END IMAGE CONSISTENCY TEST SUITE');
  console.log('================================================================\n');

  // 1. Admin Login
  console.log('Step 1: Authenticating as Admin (admin@ankita.com)...');
  const adminLogin = await makeRequest('POST', '/auth/login', { 'Content-Type': 'application/json' }, {
    email: 'admin@ankita.com',
    password: 'password123',
  });

  if (adminLogin.statusCode !== 200) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin.data));
  }
  const adminCookie = adminLogin.headers['set-cookie']
    ? (Array.isArray(adminLogin.headers['set-cookie']) ? adminLogin.headers['set-cookie'].join('; ') : adminLogin.headers['set-cookie'])
    : null;
  const adminToken = adminLogin.data?.token;
  const adminAuthHeaders = {
    ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {}),
    ...(adminCookie ? { Cookie: adminCookie } : {}),
  };
  console.log('✓ Admin login successful. Role:', adminLogin.data.user?.role || 'ADMIN');

  // 2. Upload Product A with 3 distinct images
  console.log('\nStep 2: Uploading Catalog Item "Product A" with 3 distinct images:');
  const imgDir = path.join(__dirname, 'scratch_test_images');
  const prodAFiles = [
    { fieldname: 'images[]', filename: 'prodA_primary_blue.png', path: path.join(imgDir, 'prodA_primary_blue.png'), mimetype: 'image/png' },
    { fieldname: 'images[]', filename: 'prodA_gallery2_green.png', path: path.join(imgDir, 'prodA_gallery2_green.png'), mimetype: 'image/png' },
    { fieldname: 'images[]', filename: 'prodA_gallery3_purple.png', path: path.join(imgDir, 'prodA_gallery3_purple.png'), mimetype: 'image/png' },
  ];

  const prodAFields = {
    name: 'Royal Chanderi Silk Saree - Product A',
    slug: 'royal-chanderi-silk-saree-prod-a-' + Date.now(),
    sku: 'SAREE-CHAND-A-' + Math.floor(Math.random() * 10000),
    mrp: '2999',
    sellingPrice: '1499',
    stock: '50',
    description: 'Authentic Chanderi silk saree with hand-woven zari border.',
    isPublished: 'true',
  };

  const multipartA = createMultipartFormData(prodAFields, prodAFiles);
  const createA = await makeRequest('POST', '/admin/products', {
    ...multipartA.headers,
    ...adminAuthHeaders,
  }, multipartA.body);

  if (createA.statusCode !== 200 && createA.statusCode !== 201) {
    throw new Error('Failed to create Product A: ' + JSON.stringify(createA.data));
  }

  const productA = createA.data;
  console.log('✓ Product A created with ID:', productA.id);
  console.log('  Primary Image URL:', productA.imageUrl);
  console.log('  Gallery Images Count:', productA.images?.length);
  console.log('  Gallery Images in DB Order:', productA.images?.map(i => ({ id: i.id, url: path.basename(i.url), isPrimary: i.isPrimary })));

  if (!productA.imageUrl || !productA.images || productA.images.length !== 3) {
    throw new Error('Product A images not saved properly! Images count: ' + productA.images?.length);
  }
  const primaryImgA = productA.imageUrl;

  // 3. Verify Main Store Product Listings
  console.log('\nStep 3: Verifying Main Storefront listing (/products)...');
  const storeListing = await makeRequest('GET', '/products');
  if (storeListing.statusCode !== 200) {
    throw new Error('Failed to fetch storefront products: ' + storeListing.statusCode);
  }
  const storeProdA = storeListing.data.find(p => p.id === productA.id);
  if (!storeProdA) {
    throw new Error('Product A not found in published store listing!');
  }
  console.log('✓ Product A listed on Main Store.');
  console.log('  Main Store Thumbnail:', storeProdA.imageUrl || storeProdA.images?.[0]?.url);
  if (storeProdA.imageUrl !== primaryImgA) {
    throw new Error(`Main store thumbnail (${storeProdA.imageUrl}) does not match uploaded primary image (${primaryImgA})!`);
  }

  // 4. Verify Product Details Page and Image Gallery Order
  console.log('\nStep 4: Verifying Product Details Page (/products/:slug)...');
  const pdpRes = await makeRequest('GET', `/products/${productA.slug}`);
  if (pdpRes.statusCode !== 200) {
    throw new Error('Failed to fetch PDP: ' + pdpRes.statusCode);
  }
  const pdpData = pdpRes.data;
  console.log('✓ PDP loaded successfully for slug:', pdpData.slug);
  console.log('  PDP Gallery items:', pdpData.images?.length);
  if (pdpData.images?.length !== 3) {
    throw new Error(`PDP image gallery count expected 3, got ${pdpData.images?.length}`);
  }
  if (pdpData.images[0].url !== primaryImgA) {
    throw new Error(`PDP primary gallery image (${pdpData.images[0].url}) does not match primary image (${primaryImgA})!`);
  }

  // 5. Customer Login
  console.log('\nStep 5: Authenticating as Customer (john@example.com)...');
  const custLogin = await makeRequest('POST', '/auth/login', { 'Content-Type': 'application/json' }, {
    email: 'john@example.com',
    password: 'password123',
  });
  if (custLogin.statusCode !== 200) {
    throw new Error('Customer login failed: ' + JSON.stringify(custLogin.data));
  }
  const custCookie = custLogin.headers['set-cookie']
    ? (Array.isArray(custLogin.headers['set-cookie']) ? custLogin.headers['set-cookie'].join('; ') : custLogin.headers['set-cookie'])
    : null;
  const custToken = custLogin.data?.token;
  const custAuthHeaders = {
    ...(custToken ? { Authorization: `Bearer ${custToken}` } : {}),
    ...(custCookie ? { Cookie: custCookie } : {}),
  };
  console.log('✓ Customer logged in successfully. User ID:', custLogin.data.user?.id || 2);

  // 6. Checkout / Purchase Product A
  console.log('\nStep 6: Placing an order for Product A (COD Checkout)...');
  const checkoutPayload = {
    items: [{ productId: productA.id, quantity: 1 }],
    paymentMethod: 'COD',
    shippingAddress: '42 MG Road, Surat, Gujarat - 395002. Ph: 9876543211',
    billingAddress: '42 MG Road, Surat, Gujarat - 395002. Ph: 9876543211',
    totalAmount: 1499,
  };

  const checkoutRes = await makeRequest('POST', '/checkout', {
    'Content-Type': 'application/json',
    ...custAuthHeaders,
  }, checkoutPayload);

  if (checkoutRes.statusCode !== 200 && checkoutRes.statusCode !== 201) {
    throw new Error('Checkout failed: ' + JSON.stringify(checkoutRes.data));
  }
  const orderA = checkoutRes.data.order;
  console.log('✓ Order placed successfully! Order No:', orderA.orderNo);
  const purchasedItemA = orderA.items?.[0];
  console.log('  Purchased Item Name:', purchasedItemA?.productName);
  console.log('  Purchased Item Snapshot Image:', purchasedItemA?.productImage);

  if (!purchasedItemA?.productImage) {
    throw new Error('Order item does not have snapshot productImage!');
  }
  if (purchasedItemA.productImage !== primaryImgA) {
    throw new Error(`Order item snapshot image (${purchasedItemA.productImage}) does not match uploaded primary image (${primaryImgA})!`);
  }

  // 7. Verify Customer Order History
  console.log('\nStep 7: Verifying Customer Order History (/orders & /orders/lookup/:orderNo)...');
  const custOrdersRes = await makeRequest('GET', '/orders', {
    ...custAuthHeaders,
  });
  const foundOrder = custOrdersRes.data.orders?.find(o => o.orderNo === orderA.orderNo);
  if (!foundOrder) {
    throw new Error('Placed order not found in customer order history!');
  }
  const historyItem = foundOrder.items?.[0];
  console.log('✓ Order retrieved from customer history.');
  console.log('  Customer History Item Image:', historyItem?.productImage);
  if (historyItem.productImage !== primaryImgA) {
    throw new Error('Customer order history image mismatch!');
  }

  // Also check order lookup
  const lookupRes = await makeRequest('GET', `/orders/lookup/${orderA.orderNo}`);
  if (lookupRes.statusCode !== 200 || lookupRes.data.order?.items?.[0]?.productImage !== primaryImgA) {
    throw new Error('Order lookup endpoint image verification failed!');
  }
  console.log('✓ Order Confirmation lookup verified exact photograph.');

  // 8. Verify Admin and Employee Order Details
  console.log('\nStep 8: Verifying Admin / Employee Order Details (/admin/orders/:id)...');
  const adminOrderRes = await makeRequest('GET', `/admin/orders/${orderA.id}`, {
    ...adminAuthHeaders,
  });
  const adminOrderItem = adminOrderRes.data.order?.items?.[0];
  console.log('✓ Admin Order Details loaded.');
  console.log('  Admin Order Item Image:', adminOrderItem?.productImage);
  if (adminOrderItem.productImage !== primaryImgA) {
    throw new Error('Admin order details image mismatch!');
  }

  // Accept Order, Generate Invoice, Generate Waybill
  console.log('  Accepting order in Admin panel...');
  await makeRequest('POST', `/admin/orders/${orderA.id}/accept`, { ...adminAuthHeaders });
  console.log('  Generating invoice in Admin panel...');
  const invRes = await makeRequest('POST', `/admin/orders/${orderA.id}/invoice`, { ...adminAuthHeaders });
  console.log('  ✓ Invoice generated:', invRes.data.invoiceNo);
  console.log('  Generating waybill in Admin panel...');
  const waybillRes = await makeRequest('POST', `/admin/orders/${orderA.id}/waybill`, { ...adminAuthHeaders });
  console.log('  ✓ Waybill generated. AWB:', waybillRes.data.waybill);

  // Check shipping screen
  console.log('  Verifying Shipping / Logistics screen (/admin/shipping)...');
  const shipRes = await makeRequest('GET', '/admin/shipping', { ...adminAuthHeaders });
  const shipmentRecord = shipRes.data.shipments?.find(s => s.orderNo === orderA.orderNo);
  if (!shipmentRecord) {
    throw new Error('Order not found in shipping screen!');
  }
  console.log('  ✓ Shipment found in shipping screen with item count:', shipmentRecord.items?.length);
  console.log('  Shipment item image:', shipmentRecord.items?.[0]?.productImage);
  if (shipmentRecord.items?.[0]?.productImage !== primaryImgA) {
    throw new Error('Shipping screen item image mismatch!');
  }

  // 9. Change Product A's Catalog Primary Image and Verify Snapshot Integrity
  console.log('\nStep 9: Testing Catalog Primary Image Update vs Order Historical Snapshot...');
  const newPrimaryImg = productA.images[1].url; // prodA_gallery2_green
  console.log('  Updating catalog primary image to Green gallery image:', path.basename(newPrimaryImg));

  const updateRes = await makeRequest('PUT', `/admin/products/${productA.id}`, {
    'Content-Type': 'application/json',
    ...adminAuthHeaders,
  }, {
    name: productA.name,
    slug: productA.slug,
    sku: productA.sku,
    mrp: productA.mrp,
    sellingPrice: productA.sellingPrice,
    stock: productA.stock,
    isPublished: true,
    imageUrl: newPrimaryImg,
    images: [
      { id: '1', url: newPrimaryImg, isPrimary: true, sortOrder: 0 },
      { id: '2', url: primaryImgA, isPrimary: false, sortOrder: 1 },
      { id: '3', url: productA.images[2].url, isPrimary: false, sortOrder: 2 },
    ],
  });

  if (updateRes.statusCode !== 200) {
    throw new Error('Failed to update product: ' + JSON.stringify(updateRes.data));
  }

  // Check Storefront PDP has updated primary image
  const updatedPdp = await makeRequest('GET', `/products/${productA.slug}`);
  console.log('  Updated Storefront Primary Image:', path.basename(updatedPdp.data.imageUrl || updatedPdp.data.images[0].url));
  if ((updatedPdp.data.imageUrl || updatedPdp.data.images[0].url) !== newPrimaryImg) {
    throw new Error('Storefront did not update to new primary image!');
  }
  console.log('  ✓ Live Storefront updated to new primary image.');

  // Check Historical Placed Order STILL retains the original Blue primary image
  const historicalOrderRes = await makeRequest('GET', `/admin/orders/${orderA.id}`, {
    ...adminAuthHeaders,
  });
  const historicalItemImg = historicalOrderRes.data.order?.items?.[0]?.productImage;
  console.log('  Historical Order Item Snapshot Image:', path.basename(historicalItemImg));
  if (historicalItemImg !== primaryImgA) {
    throw new Error(`CRITICAL FAILURE: Historical order image was mutated! Expected ${primaryImgA}, but got ${historicalItemImg}`);
  }
  console.log('  ✓ Historical Order Snapshot preserved perfectly (did NOT change)!');

  // 10. Repeat with Product B and Verify Complete Isolation
  console.log('\nStep 10: Uploading Product B and verifying complete image isolation (No mix-ups)...');
  const prodBFiles = [
    { fieldname: 'images[]', filename: 'prodB_primary_red.png', path: path.join(imgDir, 'prodB_primary_red.png'), mimetype: 'image/png' },
    { fieldname: 'images[]', filename: 'prodB_gallery2_gold.png', path: path.join(imgDir, 'prodB_gallery2_gold.png'), mimetype: 'image/png' },
  ];

  const prodBFields = {
    name: 'Banarasi Brocade Silk Saree - Product B',
    slug: 'banarasi-brocade-silk-saree-prod-b-' + Date.now(),
    sku: 'SAREE-BAN-B-' + Math.floor(Math.random() * 10000),
    mrp: '3999',
    sellingPrice: '1999',
    stock: '30',
    description: 'Rich Banarasi brocade silk saree with intricate gold motifs.',
    isPublished: 'true',
  };

  const multipartB = createMultipartFormData(prodBFields, prodBFiles);
  const createB = await makeRequest('POST', '/admin/products', {
    ...multipartB.headers,
    ...adminAuthHeaders,
  }, multipartB.body);

  if (createB.statusCode !== 200 && createB.statusCode !== 201) {
    throw new Error('Failed to create Product B: ' + JSON.stringify(createB.data));
  }
  const productB = createB.data;
  console.log('✓ Product B created with ID:', productB.id);
  console.log('  Product B Primary Image:', path.basename(productB.imageUrl));

  // Place order for Product B
  const orderBRes = await makeRequest('POST', '/checkout', {
    'Content-Type': 'application/json',
    ...custAuthHeaders,
  }, {
    items: [{ productId: productB.id, quantity: 2 }],
    paymentMethod: 'COD',
    shippingAddress: '77 Ring Road, Ahmedabad, Gujarat - 380015. Ph: 9876543211',
    billingAddress: '77 Ring Road, Ahmedabad, Gujarat - 380015. Ph: 9876543211',
    totalAmount: 3998,
  });

  const orderB = orderBRes.data.order;
  console.log('✓ Order placed for Product B! Order No:', orderB.orderNo);
  const itemB = orderB.items?.[0];
  console.log('  Purchased Item B Snapshot Image:', path.basename(itemB?.productImage));

  // Cross-verification: Ensure Product A image and Product B image are completely distinct!
  if (itemB.productImage === primaryImgA || itemB.productImage === newPrimaryImg) {
    throw new Error('CRITICAL FAILURE: Product B was assigned Product A image!');
  }
  if (!itemB.productImage.includes(path.basename(productB.imageUrl))) {
    throw new Error(`CRITICAL FAILURE: Order B item image (${itemB.productImage}) does not match Product B primary image (${productB.imageUrl})!`);
  }
  console.log('✓ Zero cross-contamination: Product A and Product B strictly retain their own exact uploaded photographs.');

  console.log('\n================================================================');
  console.log('ALL 10 VERIFICATION CHECKS PASSED WITH ZERO ERRORS!');
  console.log('================================================================\n');
}

runTest().catch((err) => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
