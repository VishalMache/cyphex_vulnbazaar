db = db.getSiblingDB("vulnbazaar");

db.reviews.insertMany([
  { productId: "1", author: "alice", body: "Feels premium, love the click.", rating: 5, createdAt: new Date() },
  { productId: "1", author: "bob", body: "A bit loud at night.", rating: 3, createdAt: new Date() },
  { productId: "2", author: "alice", body: "Sturdy, motor is quiet.", rating: 4, createdAt: new Date() },
  { productId: "3", author: "bob", body: "Battery life as advertised.", rating: 5, createdAt: new Date() },
]);
