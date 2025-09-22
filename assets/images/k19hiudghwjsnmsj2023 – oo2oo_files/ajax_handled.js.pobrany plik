(function($) {
  "use strict";
	jQuery(document).ready(function(){
		
		$('form#edituser input[type=text]').addClass('form-control');
		$('form#edituser input[type=password]').addClass('form-control');
		$('form#edituser select').addClass('form-control');
		$('form#edituser textarea').addClass('form-control');
		// Video Type radio
		$('input[name="chb_video_type"]').click(function(){
			var chb_video_type_value = $(this).val();
			$('div.video-type').slideUp();
			$('div.'+chb_video_type_value).slideDown();
		});
		$(".multi-select-categories").multiselect({
			checkboxName: 'video_category[]'
		});
		$(".switch-button").click(function(){	
		    $('html, body').animate({
		        scrollTop: $("#navigation-wrapper").offset().top
		    }, 1000);			
			
			$("#lightoff").fadeToggle();
		});	
		
		$('#lightoff').click(function(){
			$('#lightoff').hide();
		});			
		$('.social-share-buttons').css('display','none');
		$('a.share-button').on( "click", function() {
			var id = $(this).attr('id');
			if( id == 'off' ){
				$('.social-share-buttons').slideDown(200);
				$(this).attr('id','on');
			}
			else{
				$('.social-share-buttons').slideUp(200);
				$(this).attr('id','off');
			}
		});
		$('table#wp-calendar').addClass('table');
		$('form#vt_loginform > p > input.input').addClass('form-control');
		
		$(".comments-scrolling").click(function() {
		    $('html, body').animate({
		        scrollTop: $("div.comments").offset().top
		    }, 1000);
		});
		
		$( 'form#mars-submit-video-form input#video_file' ).on( 'change', function(event){
			var $this = $(this);
			var $form = $this.closest( 'form' );
			var files = event.target.files || event.dataTransfer.files;
			var $button = $form.find('a.upload-video-file');
			
			if( ! files['0'] || files['0'] === undefined ){
				return false;
			}
			
			var	extension = files['0']['name'].substr( ( files['0']['name'].lastIndexOf('.') + 1 ) );
			
			if( extension == "" || jQuery.inArray( extension.toLowerCase(), jsvar.video_filetypes ) == -1 ){
				alert( jsvar.error_video_filetype );
				$this.val('');
				return false;
			}
			
			var xhr = new XMLHttpRequest();
			
			var formdata = new FormData();
			
			formdata.append( 'file' , files[0] );
			formdata.append( '_ajax_nonce', jsvar._ajax_nonce );
			formdata.append( 'action', 'do_ajax_upload_video_file' );
			
			xhr.open( "POST" , jsvar.ajaxurl , true );
			
			xhr.upload.onprogress = function(e){
				$button.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
				
				var pertentText;
				
				var percentComplete = Math.ceil((e.loaded / e.total) * 100);
				
				if( percentComplete < 100 ){
					if( $form.find( 'span.percent' ).length != 0 ){
						$form.find( 'span.percent' ).html( percentComplete + '%' );
					}
					else{
						pertentText = '<span class="percent">'+percentComplete+'%</span>';
						$button.after( pertentText );						
					}
				}
				else{
					$form.find( 'span.percent' ).remove();
				}
			},
			
			xhr.onreadystatechange = function() {
			    if (xhr.readyState == 4 && xhr.status == 200) {
			    	var response = jQuery.parseJSON( xhr.responseText );
			    	if( response.resp == 'error' ){
			    		alert( response.message );
			    		$this.val('');
			    	}
			    	else{
			    		$form.find( 'input[name=attachment_id]' ).val(response.attachment_id);
			    		$button.after( '<a class="uploaded-file" href="#">'+response.attachment_name+'</a>' );
			    	}
			    	
			    	$button.removeClass( 'disabled' ).removeAttr( 'disabled' );
			    }
			},
			
			xhr.send( formdata );
			
		});
		
		$( 'form#mars-submit-video-form input#video_thumbnail' ).on( 'change', function(event){
			var $this = $(this);
			var $form = $this.closest( 'form' );
			var $group = $this.closest( '.video_thumbnail' );
			var files = event.target.files || event.dataTransfer.files;
			var $button = $form.find('a.upload-image-file');
			
			if( ! files['0'] || files['0'] === undefined ){
				return false;
			}
			
			var	extension = files['0']['name'].substr( ( files['0']['name'].lastIndexOf('.') + 1 ) );
			
			if( extension == "" || jQuery.inArray( extension.toLowerCase(), jsvar.image_filetypes ) == -1 ){
				alert( jsvar.error_image_filetype );
				$this.val('');
				return false;
			}
			
			var xhr = new XMLHttpRequest();
			
			var formdata = new FormData();
			
			formdata.append( 'file' , files[0] );
			formdata.append( '_ajax_nonce', jsvar._ajax_nonce );
			formdata.append( 'action', 'do_ajax_upload_image_file' );
			
			xhr.open( "POST" , jsvar.ajaxurl , true );
			
			xhr.upload.onprogress = function(e){
				$button.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
				
				var percentText = '';
				
				var percentComplete = Math.ceil((e.loaded / e.total) * 100);
				
				if( percentComplete < 100 ){
					if( $form.find( 'span.percent' ).length != 0 ){
						$form.find( 'span.percent' ).html( percentComplete + '%' );
					}
					else{
						percentText = '<span class="percent">'+percentComplete+'%</span>';
						$button.after( percentText );						
					}
				}
				else{
					$form.find( 'span.percent' ).remove();
				}
			},
			
			xhr.onreadystatechange = function() {
			    if (xhr.readyState == 4 && xhr.status == 200) {
			    	var response = jQuery.parseJSON( xhr.responseText );
			    	if( response.resp == 'error' ){
			    		alert( response.message );
			    		$this.val('');
			    	}
			    	else{
			    		$form.find( 'input[name=_thumbnail_id]' ).val(response.attachment_id);
			    		
			    		if( $group.find( '.thumbnail-image' ).length != 0 ){
			    			$group.find( '.thumbnail-image' ).remove();
			    		}
			    		
			    		var $img = '';
			    		$img +=	'<div class="thumbnail-image">';
			    		$img +=		'<img src="'+response.attachment_url+'">';
			    		$img +=	'</div>';
			    		$group.append($img);
			    	}
			    	
			    	$button.removeClass( 'disabled' ).removeAttr( 'disabled' );
			    }
			},
			
			xhr.send( formdata );
			
		});		

	    $('form#mars-submit-video-form').submit(function(){
	    	
	    	var $this = $(this);
			var $data	=	$this.serialize();
			var $button	=	$this.find( 'button[type=submit]' );
			var $group	=	$this.find( '.group-submit' );
			
			$.ajax({
				url: jsvar.ajaxurl,
				method: 'POST',
				data: {
					'data': $data,
					'_ajax_nonce': jsvar._ajax_nonce,
					'action': 'do_ajax_submit_video'
				},
				beforeSend: function(){
					$button.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
					$this.find( '.alert-danger' ).remove();
				}
			}).done(function( $response ) {
				var $response = $.parseJSON($response);
				if( $response.resp == 'error' ){
					var $text = '<div class="alert alert-danger" role="alert">'+$response.message+'</div>';
					$group.append( $text );
				}
				else{
					window.location.href = $response.redirect_to;
				}
				
				$button.removeClass( 'disabled' ).removeAttr( 'disabled' );

			});
			
			return false;

	    });
	    
	    $( 'button#delete-video' ).click( function(e){
	    	var $this = $(this);
	    	var $post_id = $this.attr( 'data-id' );
	    	var $form = $this.closest('form');
	    	var $group	=	$form.find( '.group-submit' );
	    	if( confirm( jsvar.delete_video_confirm ) === true ){
				$.ajax({
					url: jsvar.ajaxurl,
					method: 'POST',
					data: {
						'post_id': $post_id,
						'_ajax_nonce': jsvar._ajax_nonce,
						'action': 'do_ajax_delete_video'
					},
					beforeSend: function(){
						$this.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
					}
				}).done(function( $response ) {
					var $response = $.parseJSON($response);
					if( $response.resp == 'error' ){
						$this.removeClass( 'disabled' ).removeAttr( 'disabled' );
						var $text = '<div class="alert alert-danger" role="alert">'+$response.message+'</div>';
						$group.append( $text );
						return false;
					}
					else{
						window.location.href = $response.redirect_to;
					}
				});
	    	}
	    	return false;
	    	
	    } );
	    
	    $( '.likes-dislikes' ).click( function(e){
	    	var $this = $(this);
	    	var $post_id = $this.attr( 'id' );
	    	var $parent;
	    	
	    	$parent = $this.closest( '.box-like' );
	    	
			$.ajax({
				url: jsvar.ajaxurl,
				method: 'POST',
				data: {
					'post_id': $post_id,
					'_ajax_nonce': jsvar._ajax_nonce,
					'action': 'do_ajax_like_video'
				},
				beforeSend: function(){
					$parent.css( 'opacity', '.5' );
				}
			}).done(function( $response ) {
				var $response = $.parseJSON($response);
				if( $response.resp == 'error' ){
					alert( $response.message );
				}
				else{
					$( 'label.like-count' ).html( $response.count );
				}
				$parent.css( 'opacity', '1' );
			});
			
			return false;	    	
	    } );
	    		
		$('form#mars-subscribe-form').submit(function(){
			var name = $('form#mars-subscribe-form input#name').val();
			var email = $('form#mars-subscribe-form input#email').val();
			var referer = $('form#mars-subscribe-form input[name="referer"]').val();
			var agree = $('form#mars-subscribe-form input#agree').is(':checked');
			jQuery.ajax({
				type:'POST',
				data:'action=mars_subscrib_act&name='+name+'&email='+email+'&agree='+agree+'&referer='+referer,
				url:jsvar.ajaxurl,
				beforeSend:function(){
					$('form#mars-subscribe-form button[type="submit"]').text('...');
					$('div.alert').remove();
				},
				success:function(data){
					var data = $.parseJSON(data);
					if( data.resp == 'error' ){
						$('form#mars-subscribe-form div.name').before('<div class="alert alert-warning">'+data.message+'</div>');
						$('form#mars-subscribe-form input#'+data.id).focus();
					}
					else{
						$('form#mars-subscribe-form div.name').before('<div class="alert alert-success">'+data.message+'</div>');
						window.location.href = data.redirect_to;
					}
					$('form#mars-subscribe-form button[type="submit"]').text( $('form#mars-subscribe-form input[name="submit-label"]').val());
				}				
			});
			return false;
		});
		$('form#vt_loginform').submit(function(){
			var $this = $(this);
			var data_form = $this.serialize();
			var $button = $this.find( 'input[type=submit]' );
			$.ajax({
				type:'POST',
				data: {
					'data': data_form,
					'_ajax_nonce': jsvar._ajax_nonce,
					'action': 'vt_ajax_login'
				},
				url: jsvar.ajaxurl,
				beforeSend:function(){
					$('.alert').slideUp('slow');
					$('.alert').html('');
					$button.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
				},				
				success: function(data){
					var data = $.parseJSON(data);
					if( data.resp == 'error' ){
						$('.alert').removeClass('alert-success');
						$('.alert').addClass('alert-danger');
						$('.alert').html(data.message);
						$('.alert').slideDown('slow');
					}
					else if( data.resp =='success' ){
						window.location.href = data.redirect_to;
					}
					$button.removeClass( 'disabled' ).removeAttr( 'disabled' );
				}
			});
			return false;
		});
		$('form#registerform').submit(function(){
			var $this = $(this);
			var data_form = $this.serialize();
			var $button = $this.find( 'input[type=submit]' );
			$.ajax({
				type:'POST',
				data: {
					'data': data_form,
					'_ajax_nonce': jsvar._ajax_nonce,
					'action': 'vt_ajax_register'
				},
				url: jsvar.ajaxurl,
				beforeSend:function(){
					$('.alert').slideUp('slow');
					$('.alert').html('');
					$button.addClass( 'disabled' ).attr( 'disabled', 'disabled' );
				},				
				success: function(data){
					var data = $.parseJSON(data);
					if( data.resp == 'error' ){
						$('.alert').removeClass('alert-success');
						$('.alert').addClass('alert-danger');
						$('.alert').html(data.message);
						$('.alert').slideDown('slow');
					}
					else if( data.resp =='success' ){
						$('.alert').addClass('alert-success');
						$('.alert').removeClass('alert-danger');
						$('.alert').html(data.message);
						$('.alert').slideDown('slow');
					}
					$button.removeClass( 'disabled' ).removeAttr( 'disabled' );
				}
			});
			return false;
		});		
		$('form#lostpasswordform').submit(function(){
			var data_form = $(this).serialize();
			jQuery.ajax({
				type:'POST',
				data: data_form,
				url: jsvar.ajaxurl,
				beforeSend:function(){
					$('.alert-danger').slideUp('slow');
					$('form#lostpasswordform button[type="submit"]').text('...');
				},				
				success: function(data){
					var data = $.parseJSON(data);
					if( data.resp == 'error' ){
						$('.alert-danger').html(data.message);
						$('.alert-danger').slideDown('slow');
					}
					else if( data.resp =='success' ){
						window.location.href = data.redirect_to;
					}
					$('form#lostpasswordform button[type="submit"]').text( $('form#lostpasswordform input[name="button_label"]').val() );
				}
			});
			return false;			
		});		
	});
})(jQuery);