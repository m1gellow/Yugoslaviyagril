import { Product, Category, Restaurant, RestaurantProduct, ProductReview } from '../types';

export const restaurants: Restaurant[] = [
  {
    id: 5,
    name: 'Закусочная на Латвийской',
    address: 'Волгоградская, 178',
    phone: '+7 (937) 000-03-07',
    url: '/latviyskaya/',
    minOrderAmount: 1000,
    freeDeliveryThreshold: 5000,
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-60 мин',
    location: {
      lat: 56.833802,
      lng: 60.600434,
    },
  },
  {
    id: 4,
    name: 'Кафе на Фронтовых бригад',
    address: 'Фронтовых бригад, 33А',
    phone: '+7 (937) 000-03-07',
    url: '/frontovickh/',
    minOrderAmount: 1000,
    freeDeliveryThreshold: 5000,
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-60 мин',
    location: {
      lat: 56.828926,
      lng: 60.649726,
    },
  },
  {
    id: 2,
    name: 'Кафе на Ясной',
    address: 'Ясная, 6',
    phone: '+7 (937) 000-03-07',
    url: '/yasnaya/',
    minOrderAmount: 1500,
    freeDeliveryThreshold: 5000,
    workingHours: '10:00 - 22:00',
    deliveryTime: '30-60 мин',
    location: {
      lat: 56.830926,
      lng: 60.588922,
    },
  },
  {
    id: 1,
    name: 'Ресторан на Белинского',
    address: 'Белинского, 200',
    phone: '+7 (937) 000-03-07',
    url: '/belinskogo/',
    minOrderAmount: 2500,
    freeDeliveryThreshold: 5000,
    workingHours: '10:00 - 22:00',
    deliveryTime: '40-70 мин',
    location: {
      lat: 56.81685,
      lng: 60.630733,
    },
  },
];

export const categories: Category[] = [
  { id: 26, name: 'Бургеры', icon: 'burger' },
  { id: 27, name: 'Блюда на гриле', icon: 'grill' },
  { id: 28, name: 'Блюда на компанию', icon: 'group' },
  { id: 29, name: 'Гарниры', icon: 'fries' },
  { id: 30, name: 'Домашняя выпечка', icon: 'bread' },
  { id: 31, name: 'Соусы', icon: 'sauce' },
  { id: 32, name: 'Напитки', icon: 'drink' },
  { id: 37, name: 'Супы', icon: 'soup' },
  { id: 38, name: 'Горячие блюда (рыба на гриле)', icon: 'fish' },
  { id: 35, name: 'Горячие закуски', icon: 'appetizer' },
  { id: 40, name: 'Салаты', icon: 'salad' },
];

// Базовые продукты (цены для ресторана по умолчанию - Фронтовых бригад, 33А)
export const products: Product[] = [
  {
    id: 219,
    name: 'Бургер XXXL',
    description:
      'Свиная шея, куриное филе, плескавица для гурманов, бекон, приготовленные на гриле, с добавлением сыра, в сербской лепешке, с овощами и соусом на выбор.',
    price: 520,
    weight: '700гр.',
    image:
      'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.9,
    reviewsCount: 150,
  },
  {
    id: 220,
    name: 'Фирменный бургер',
    description:
      'Две сочные плескавицы из говядины (для гурманов и классическая), бекон, приготовленные на гриле, с лобавлением сыра, в сербской лепешке, с овощами и соусом на выбор.',
    price: 480,
    weight: '500гр.',
    image:
      'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.8,
    reviewsCount: 128,
  },
  {
    id: 222,
    name: 'Бургер с куриным окороком',
    description: 'Сочный окорок без кости, приготовленный на гриле, в сербской лепешке, с овощами и соусом на выбор.',
    price: 350,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.6,
    reviewsCount: 75,
  },
  {
    id: 223,
    name: 'Бургер с куриным филе',
    description:
      'Нежное филе куриной грудки, приготовленное на гриле, в сербской лепешке, с овощами и соусом на выбор.',
    price: 340,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.7,
    reviewsCount: 92,
  },
  {
    id: 224,
    name: 'Бургер со свиной шеей',
    description: 'Свиная шея, приготовленная на гриле, в сербской лепешке, овощами и соусом на выбор.',
    price: 350,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/3219547/pexels-photo-3219547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.5,
    reviewsCount: 87,
  },
  {
    id: 225,
    name: 'Бургер с чевапи в беконе',
    description:
      'Сербские колбаски из фарша говядины и специй, в беконе, приготовленные на гриле, в сербской лепешке, с овощами и соусом на выбор.',
    price: 370,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/2725744/pexels-photo-2725744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.8,
    reviewsCount: 104,
  },
  {
    id: 226,
    name: 'Бургер с чевапи',
    description:
      'Сербские колбаски из фарша говядины и специй, приготовленные на гриле, в сербской лепешке, с овощами и соусом на выбор.',
    price: 350,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/7937396/pexels-photo-7937396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.6,
    reviewsCount: 95,
  },
  {
    id: 227,
    name: 'Бургер лесковачки уштипак',
    description:
      'В меру острые сербские мини-котлетки из говядины, сыра, ветчины и чеснока, приготовленные на гриле, в сербской лепешке, с овощами и соусом на выбор.',
    price: 350,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/10922926/pexels-photo-10922926.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.7,
    reviewsCount: 83,
  },
  {
    id: 228,
    name: 'Бургер с фаршированной плескавицей',
    description:
      'Сербская котлета из фарша говядины, с добавлением лука, фаршированная ветчиной и сыром, приготовленная на гриле, в сербской лепешке, с овощами и соусом на выбор',
    price: 380,
    weight: '400гр.',
    image:
      'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    categoryId: 26,
    rating: 4.9,
    reviewsCount: 110,
  },
];

// Цены продуктов для разных ресторанов
export const restaurantProducts: RestaurantProduct[] = [
  // Ресторан на Белинского (id: 1) - премиум ресторан, цены выше
  { productId: 219, restaurantId: 1, price: 590 },
  { productId: 220, restaurantId: 1, price: 550 },
  { productId: 222, restaurantId: 1, price: 390 },
  { productId: 223, restaurantId: 1, price: 380 },
  { productId: 224, restaurantId: 1, price: 390 },
  { productId: 225, restaurantId: 1, price: 420 },
  { productId: 226, restaurantId: 1, price: 390 },
  { productId: 227, restaurantId: 1, price: 390 },
  { productId: 228, restaurantId: 1, price: 430 },

  // Кафе на Ясной (id: 2) - стандартные цены
  { productId: 219, restaurantId: 2, price: 520 },
  { productId: 220, restaurantId: 2, price: 480 },
  { productId: 222, restaurantId: 2, price: 350 },
  { productId: 223, restaurantId: 2, price: 340 },
  { productId: 224, restaurantId: 2, price: 350 },
  { productId: 225, restaurantId: 2, price: 370 },
  { productId: 226, restaurantId: 2, price: 350 },
  { productId: 227, restaurantId: 2, price: 350 },
  { productId: 228, restaurantId: 2, price: 380 },

  // Закусочная на Латвийской (id: 5) - цены чуть ниже
  { productId: 219, restaurantId: 5, price: 490 },
  { productId: 220, restaurantId: 5, price: 450 },
  { productId: 222, restaurantId: 5, price: 330 },
  { productId: 223, restaurantId: 5, price: 320 },
  { productId: 224, restaurantId: 5, price: 330 },
  { productId: 225, restaurantId: 5, price: 350 },
  { productId: 226, restaurantId: 5, price: 330 },
  { productId: 227, restaurantId: 5, price: 330 },
  { productId: 228, restaurantId: 5, price: 360 },
];

export const sliderImages = [
  {
    id: 1,
    image: 'https://югославия-гриль.рф/static/img/slide1.png',
    title: 'Домашняя атмосфера',
    subtitle: 'и частичка Сербии',
  },
  {
    id: 2,
    image: 'https://югославия-гриль.рф/static/img/slide2.png',
    title: 'Самые вкусные блюда',
    subtitle: 'сербской кухни',
  },
  {
    id: 3,
    image: 'https://югославия-гриль.рф/static/img/slide3.png',
    title: 'Если ты до сих пор мало знаешь о',
    subtitle: 'сербской кухне - самое время попробовать!',
  },
  {
    id: 4,
    image: 'https://югославия-гриль.рф/static/img/slide1.png',
    title: 'Домашняя атмосфера',
    subtitle: 'и частичка Сербии',
  },
  {
    id: 5,
    image: 'https://югославия-гриль.рф/static/img/slide2.png',
    title: 'Самые вкусные блюда',
    subtitle: 'сербской кухни',
  },
  {
    id: 6,
    image: 'https://югославия-гриль.рф/static/img/slide3.png',
    title: 'Если ты до сих пор мало знаешь о',
    subtitle: 'сербской кухне - самое время попробовать!',
  },
];

export const sauces = [
  { id: 1, name: 'Сербский', price: 100 },
  { id: 2, name: 'Чесночный', price: 100 },
  { id: 3, name: 'Тар-тар', price: 100 },
  { id: 4, name: 'Сметана с огурцом', price: 100 },
  { id: 5, name: 'Томатный', price: 100 },
];

export const sideDishes = [
  { id: 1, name: 'Картофель фри', price: 100 },
  { id: 2, name: 'Картофельные дольки', price: 100 },
  { id: 3, name: 'Овощи гриль', price: 100 },
  { id: 4, name: 'Сербская лепешка', price: 100 },
];

// Отзывы пользователей для товаров (имитация реальных отзывов)
export const productReviews: ProductReview[] = [
  {
    id: 1,
    productId: 219,
    userId: 'user1',
    rating: 5,
    comment: 'Потрясающий бургер! Огромный размер, все ингредиенты свежие и качественные.',
    date: '2025-06-10',
    userName: 'Алексей К.',
    orderNumber: 'ORD-12345',
  },
  {
    id: 2,
    productId: 219,
    userId: 'user2',
    rating: 5,
    comment: 'Лучший бургер, который я когда-либо пробовал. На одного человека много!',
    date: '2025-06-08',
    userName: 'Мария С.',
    orderNumber: 'ORD-12346',
  },
  {
    id: 3,
    productId: 220,
    userId: 'user3',
    rating: 4,
    comment: 'Очень вкусно, но немного острый соус. В следующий раз попрошу другой.',
    date: '2025-06-07',
    userName: 'Иван П.',
    orderNumber: 'ORD-12347',
  },
  {
    id: 4,
    productId: 222,
    userId: 'user4',
    rating: 5,
    comment: 'Куриный окорок сочный и прекрасно приготовлен!',
    date: '2025-06-05',
    userName: 'Елена В.',
    orderNumber: 'ORD-12348',
  },
];

// Функция получения цены продукта для конкретного ресторана
export const getProductPriceForRestaurant = (productId: number, restaurantId: number): number => {
  const restaurantProduct = restaurantProducts.find(
    (rp) => rp.productId === productId && rp.restaurantId === restaurantId,
  );

  if (restaurantProduct) {
    return restaurantProduct.price;
  }

  // Если для ресторана нет специальной цены, вернуть стандартную цену продукта
  const product = products.find((p) => p.id === productId);
  return product ? product.price : 0;
};

// Функция для получения отзывов о товаре
export const getProductReviews = (productId: number): ProductReview[] => {
  return productReviews.filter((review) => review.productId === productId);
};

// Функция для добавления нового отзыва
export const addProductReview = (
  productId: number,
  userId: string,
  rating: number,
  comment: string,
  userName: string,
  orderNumber?: string,
): ProductReview => {
  const newReview = {
    id: productReviews.length + 1,
    productId,
    userId,
    rating,
    comment,
    date: new Date().toISOString().split('T')[0],
    userName,
    orderNumber,
  };

  productReviews.push(newReview);
  return newReview;
};
