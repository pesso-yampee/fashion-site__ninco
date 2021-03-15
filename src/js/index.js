import $ from 'jquery'
import 'slick-carousel';
import "slick-carousel/slick/slick.scss";
import "slick-carousel/slick/slick.min.js";
import '../scss/app.scss'
import item_data from './item_data.js';
import './jquery.elevatezoom.js';

$(() => {
  const page_type   = $('.contents').attr('id'),
        categorys   = ['men', 'woman', 'kids'],
        param_key   = location.search.substring(1).split('=')[0],
        param_value = location.search.substring(1).split('=')[1];

  let more_count = {
    'brand': 3,
    'items': 10
  };

  // オブジェクトをhtmlに変換する
  // 返り値: html
  function createDom(items, delete_btn_flg = null) {
    /*
      仮に「delete_btn_flg = false」だと、
      他でcreateDomする時に毎回毎回、第2実引数にfalseをとらなくてはいけない。
    */
    const imgPath = "/assets/images/";

    let html_template = '',
        delete_dom    = '';

    if (delete_btn_flg) {
      delete_dom = `<div class="cart-delete"><img src="${imgPath}/icon_delete.svg"></div>`;
    }

    items.forEach(function(item, index) {
      html_template +=
        `<li class="c-blockList__item" data-item-id="${item.id}">
          <a href="/detail/index.html?id=${item.id}">
            <div class="c-blockList__item__cap">
              <img src="${imgPath}/item/${item.id}.png" alt="new item">
            </div>
            <ul class="c-blockList__item__txtList">
              <li class="c-blockList__item__txtList__item">
                <p class="c-blockList__item__txtList__item__product">${item.name}</p>
                <p class="c-blockList__item__txtList__item__detail">${item.text}</p>
                <p class="c-blockList__item__txtList__item__price">¥${item.price}</p>
              </li>
            </ul>
          </a>
          ${delete_dom}
        </li>
      `;
    });

    return html_template;
  }

  // 関数 もっと見るボタン
  function moreControl(el, num) {
    const more_type   = $(el).attr('data-more-btn'),
          target_list = $(`[data-more-list="${more_type}"]`),
          max_count   = target_list.children('li').length;

    more_count[more_type] += num;

    target_list.children(`li:lt(${more_count[more_type]})`).fadeIn();

    if (more_count[more_type] >= max_count) {
      $(el).hide();
    }
  }

  function searchWordShow() {
    let result_text;

    if (param_key == 'price') {
      result_text = `〜${param_value}円`;
      $(`jsi-price-select option[value="${param_value}"]`).prop('selected', true);
    } else {
      result_text = param_value;
    }

    $('.jsc-elem-add').text(decodeURI(result_text));
  }

  function getItemSingle() {
    return item_data.find(function (item) {
      return item['id'] == param_value;
    })
  }

  // item_dataのnewプロパティの真偽値を判定する
  // 返り値: items
  function getItemList(key, value = null) { // valueはなくてもいいけど、あったら使うよ!という意味
    const search_value = value ? value : param_value, // パラメーターがあるかどうか
          freeWords    = ['name', 'text'];

    const items = item_data.filter(function (item, index) {
      switch (key) {
        case 'brand':
        case 'category':
          return item[key] == search_value
          break;
        case 'freeWord':
          return freeWords.find(function (freeWord) {
            return item[freeWord].indexOf(decodeURI(param_value)) !== -1;
          });
          break;
        case 'price':
          return item[key] <= search_value
          break;
        case 'new':
          return item.new
          break;
      }
    });
    searchWordShow();

    return items;
  }

  function pickUpShuffle(item_data) {
    let items      = [],
        rand_check = []; // 重複があるかどうかを確認する用

    for (let i = 0; i < 6; i++) {
      let j = Math.floor(Math.random() * item_data.length);

      if (rand_check.indexOf(j) !== -1) {
        i--; // 値が被ると与えられる要素が3つとか4つになっちゃう。それを防ぐため！ 絶対に重複がない
        continue;
      } else {
        rand_check.push(j);
        items.push(item_data[j]);
      }
    }
    return items;
  }

  function storageControl(id, type) {
    let strage_data = JSON.parse(localStorage.getItem(`ninco_${type}`));

    id = Number(id);

    if (strage_data == null) {
      strage_data = [id]; // 配列として入れる
    } else { // データが1つ以上ある時
      if (strage_data.indexOf(id) !== -1) { // 同じものが入っていた場合
        strage_data.splice(strage_data.indexOf(id), 1); // 消去する
      } else {
        strage_data.push(id);
      }
    }

    localStorage.setItem(`ninco_${type}`, JSON.stringify(strage_data));
  }

  function storageSaveJudge(id, type) {
    let strage_data = JSON.parse(localStorage.getItem(`ninco_${type}`));
    id = Number(id);

    if (strage_data !== null) { // もし要素が入っていたら
      return strage_data.indexOf(id) !== -1; // true
    }
  }

  function doneFlash(text) {
    $('body').append(`<div class="c-flash">${text}</div>`);
    setTimeout(function() {
      location.reload(); // ローカルストレージはリロードされた時に反映されるため
    }, 2000);
  }

  $('.jsc-slick').slick({
    speed: 2000,
    autoplay: true,
    autoplaySpeed: 3000,
    dots: true,
    arrows: true,
    pauseOnHover: true,
    slidesToShow: 1,
    centerMode: true,
    centerPadding: '25%',
    prevArrow: '<div class="prev"></div>',
    nextArrow: '<div class="next"></div>',
    dotsClass: 'slick-dots',

    responsive: [{
      breakpoint: 768,
      settings: {
        centerMode: false,
        centerPadding: false
      }
    }]
  });

  $(window).on('load', function() {

    // ローディング
    setTimeout(function() {
      $('.jsi-elem-fadeOut').fadeOut();
    }, 600);
  });

  $(window).on('scroll', function() {
    const scrollPos = $(this).scrollTop(),
          wHeight   = $(this).innerHeight();

    // フェードイン
    $('[data-fadeIn]').each(function (index, el) {
      const elePos = $(el).offset().top;

      if (scrollPos > elePos - (wHeight / 2)) {
        $(el).addClass('is-show');
      }
    });

    // ころりん
    $('.jsc-elem-slide-rotate').each(function() {
      const brandPos = $('.jsi-elem-pos').offset().top,
            menPos   = $('.jsi-men-pos').offset().top;

      (scrollPos > menPos - wHeight ? $(this).addClass('is-show') : $(this).removeClass('is-show'));

      (scrollPos > brandPos - wHeight / 2 + 100 ? $(this).removeClass('is-show') : $(this).addClass('is-show'));
    });
  });

  // ハンバーガーメニュー
  $('.jsc-elem-trigger').on('touchstart', function(e) {
    e.preventDefault();

    $('.jsc-elem-change').toggleClass('is-active');
    $('.jsc-elem-slideIn').toggleClass('is-active');
  });

  // サイズ選択
  $('.jsc-elem-select').on('click', function() {
    const $select_size = $(this).text();

    $(this).addClass('is-active');
    $(this).siblings().removeClass('is-active'); // 押した要素の兄弟要素

    $('.jsc-elem-size').text($select_size);
  });

  // レビュー選択
  const selectReview = (function() {
    let review_num = 0;

    $('.jsc-elem-review').on('click', function() {
      if (review_num == $('.jsc-elem-review').index(this) + 1) {
        $('.jsc-elem-review').removeClass('is-active');
        review_num = 0;
      } else {
        review_num = $('.jsc-elem-review').index(this) + 1;
        $('.jsc-elem-review').removeClass('is-active');
        $(`.jsc-elem-review:lt('${review_num}')`).addClass('is-active');
      }
    });
  })();

  // 商品説明
  $('.jsc-elem-show').on('click', function() {
    $(this).toggleClass('is-active');

    $('.jsc-elem-slideDown').slideToggle();
  });

  // NEWの一覧を取得
  if (page_type == 'page_index') {
    let item_list_new = getItemList('new');

    $('[data-item-list="new"]').append(createDom(item_list_new));

    categorys.forEach(function (category) {
      let item_list_category = getItemList('category', category);

      item_list_category = createDom(item_list_category);
      $(`[data-item-list="${category}"]`).append(item_list_category);
    });
  }

  // カートからアイテムを削除
  $('body').on('click', '.cart-delete', function() {
    if (confirm('本当に削除して良いですか？')) {
      const item_id = $(this).parents('[data-item-id]').attr('data-item-id');

      storageControl(item_id, 'cart');

      setTimeout(function() {
        location.reload();
      }, 200);
    }
  });

  // 購入ボタンを押した時の処理
  $('.jsi-btn-buy').on('click', function() {
    if (confirm('購入して良いですか？')) {
      localStorage.removeItem('ninco_cart');
      alert('購入しました！');
      location.reload(); // 一応つけとく
    }
  });

  // カートに追加
  $('.jsc-btn-addCart').on('click', function() {
    const item_id = $(this).parents('.jsi-elem-detail').attr('data-item-id');
    
    storageControl(item_id, 'cart');

    if (storageSaveJudge(item_id, 'cart')) {
      doneFlash('カートに追加しました。');
    } else {
      doneFlash('カートから外しました。');
    }
  });

  // カートに入れたアイテムを生成
  const cart_storage = JSON.parse(localStorage.getItem('ninco_cart'));

  // ストレージ合計値計算
  if (cart_storage !== null) {
    let cart_price = 0;

    const cart_items = item_data.filter(function (item) {
      if (cart_storage.indexOf(item.id) !== -1) {
        cart_price += item.price;
        return item;
      }
    });

    $('#cart-list').append(createDom(cart_items, true));
    $('[data-total-num="number"],.jsc-elem-batch').text(cart_storage.length);

    if (cart_storage.length <= 0) {
      $('.jsc-elem-batch').hide();
    }

    $('[data-total-num="price"]').text(cart_price);
  } else {
    $('.jsc-elem-batch').hide();
  }

  // お気に入りに追加
  $('.jsc-btn-addFav').on('click', function() {
    const item_id = $(this).parents('.jsi-elem-detail').attr('data-item-id');

    storageControl(item_id, 'fav');

    if (storageSaveJudge(item_id, 'fav')) {
      doneFlash('お気に入りに追加しました。');
    } else {
      doneFlash('お気に入りから外しました。');
    }
  });

  // お気に入りに入れたアイテムを生成
  const fav_storage = JSON.parse(localStorage.getItem('ninco_fav'));

  // ストレージ合計値計算
  if (fav_storage !== null) {
    const fav_items = item_data.filter(function(item) {
      if (fav_storage.indexOf(item.id) !== -1) {
        return item;
      }
    });

    $('[data-item-list="fav"]').append(createDom(fav_items));

    // お気に入りのスライダー
    const fav_slide_count = $(window).width() >= 768 ? 5 : 3;

    if (fav_items.length > fav_slide_count) {
      $('[data-item-list="fav"]').slick({
        arrows: true,
        autoplay: true,
        dots: false,
        speed: 1000,
        easing: 'swing',
        slidesToShow: 5,
        slidesToScroll: 1,
        adaptiveHeight: true,
        prevArrow: '<div class="prev"></div>',
        nextArrow: '<div class="next"></div>',
  
        responsive: [{
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
          }
        }]
      });
    }
  }

  // 詳細ページ
  if (page_type == 'page_detail') {
    const item_detail = getItemSingle();

    Object.keys(item_detail).forEach(function (key) {
      $(`[data-item-parts="${key}"]`).text(item_detail[key]);
    });

    $('#zoom-image').attr('src', `/assets/images/item/${item_detail.id}.png`);
    $('#zoom-image').attr('data-zoom-image', `/assets/images/item/${item_detail.id}_l.png`);
    $('.jsi-elem-detail').attr('data-item-id', item_detail.id);

    if (!item_detail.new) {
      $('.new-label').remove();
    }

    function judge(storage_type, class_type) {
      if (storageSaveJudge(item_detail.id, storage_type)) {
        $(`.jsc-btn-add${class_type}`).addClass('is-active');
      }
    }

    judge('cart', 'Cart');
    judge('fav', 'Fav');

    $('[data-zoom-image]').elevateZoom();
  }

  // 一覧ページ
  if (page_type == 'page_list') {
    const item_list = createDom(getItemList(param_key));

    
    $('[data-more-list="items"]').append(item_list);
    $('.jsi-price-select').on('change', function() {
      $('#price-form').submit();
    });
  }

  // ピックアップリスト作成
  const item_list_pickup = createDom(pickUpShuffle(item_data));

  $('[data-item-list="pickup"]').append(item_list_pickup);


  // モーダル実装
  $('.jsi-elem-trigger-strage').on('click', function(e) {
    e.preventDefault(); // aタグの遷移する能力を打ち消す

    $('.jsc-elem-fadeToggle').addClass('is-active');
    // スマホ用
    $('.jsc-elem-change, .jsc-elem-slideIn').removeClass('is-active');
  });


  $('.jsi-elem-close').on('click', function(e) {
    e.preventDefault(); // aタグの遷移する能力を打ち消す

    $('.jsc-elem-fadeToggle').removeClass('is-active');
  });

  $('.jsc-elem-fadeToggle').on('click', function() {
    $(this).removeClass('is-active');
  });

  // もっと見るボタン実装
  $('[data-more-btn="brand"]').on('click', function() {
    moreControl($(this), 3);
  });

  $('[data-more-btn="items"]').on('click', function() {
    moreControl($(this), 10);
  });

  // スマホ用 サイドバー 実装
  $('.jsi-elem-trigger').on('click', function() {
    $(this).next('.jsc-elem-slide').toggleClass('is-show');
  })
})