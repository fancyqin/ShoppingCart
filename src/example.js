$(function(){

    var LiHTML =  '<li class="shop-item J-item" id="{id}">'+
    '<span class="name">{name}</span><span class="price">{price}</span>'+
    '<div class="func"><button class="J-plus">+</button><span class="nums">{nums}</span><button class="J-minus">-</button> <button class="J-del">del</button></div>'+
    '</li>'

    var $shop = $('.J-shop'),
        $list = $shop.find('.J-list'),
        $add = $shop.find('.J-add'),    
        $clean = $shop.find('.J-clean'),
        $update = $shop.find('.J-update');

    var shop = new ShoppingCart({
        url:{
            getData:'/data.json',
            postData:'/todotodo'
        },
        render:function(data){
            $('.J-data').html(JSON.stringify(data));
            $list.html('');
            var totalPrice = 0;
            $.each(data,function(i,n){
                var html = LiHTML.replace('{id}',n['id']).replace('{name}',n['name']).replace('{price}',n['price']).replace('{nums}',n['nums']);
                $list.append(html);
                totalPrice += Number(n['price']*n['nums']);
            });
            $('.J-totalPrice').text(totalPrice);
        }
    });

    shop.on('add',function(data){
        console.log('add success!');
    })

    shop.on('edit',function(data){
        console.log('edit success!');
    })

    shop.on('delete',function(data){
        console.log('delete success!');
    })

    shop.on('clean',function(){
        console.log('clean over!')
    })

    $update.on('click',function(){
        shop.update(function(){
            shop.render();
        })
    })

    //增加一个
    $add.on('click',function(){
        var testData = {
            id:'5',
            name:'shoes fewgf 123',
            price: 200,
            nums:1
        }
        shop.add(testData);
    })

    //删除
    $list.on('click','.J-del',function(){
        var id = $(this).closest('.J-item').attr('id');
        shop.delete(id);
    }).on('click','.J-plus',function(){
        var dad = $(this).closest('.J-item')
        var newData = {
            id: dad.attr('id'),
            name: dad.find('.name').text(),
            price: Number(dad.find('.price').text()),
            nums: Number(dad.find('.nums').text())+1
        }
        shop.edit(newData);
    }).on('click','.J-minus',function(){
        var dad = $(this).closest('.J-item')
        var newData = {
            id: dad.attr('id'),
            name: dad.find('.name').text(),
            price: Number(dad.find('.price').text()),
            nums: Number(dad.find('.nums').text())-1
        }
        if(newData.nums === 0){
            shop.delete(dad.attr('id'));
        }else{
            shop.edit(newData);
        } 
    })
    
    //清空
    $clean.on('click',function(){
        var conf = window.confirm('Are u sure clean?');
        conf && shop.clean();
    })


})