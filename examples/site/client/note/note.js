jQuery(function($){
    'use strict';
    //model
    var confirms = window.Cookies && Cookies.get('confirms'),
        $notice = $('#vacation-note'),
        minConfirms = 2,
        noticeDisabled = window.noticeDisabled || false,
        now = new Date(),
        expireDate = new Date(2100, 12, 31);

    if (!confirms) confirms = 0;

    if (now < expireDate && confirms < minConfirms && !noticeDisabled){
        // let us dance!
        setTimeout(function(){
            $notice.css({
                top: 0,
                boxShadow: '#666 0px 0px 10px'
            })
        }, 900);
    }

    $(document).on('click', '[data-confirm="vacation"]', function(){
        Cookies.set('confirms', ++confirms , {expires: new Date(2100, 12, 31)});
        $notice.trigger($.Event('click.confirm.vacation'));
    });

    $notice.on('click.confirm.vacation', function(){
        var $this = $(this);
        $this.css({ top: '-1000px'});
        $('[data-confirm="vacation"]').fadeOut();
    });
});