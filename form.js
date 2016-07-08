//
// This is a re-usable Form component.
//
// Currently we are only using-it for:
//
//  -- Showing error messages with ajax:error callback.
//  -- Setting the parent input elements with .focus className on input.on('focus') event.
//  -- Keep-adding setup
//
//
// Errors JSON response should came as a key => value Object (where key is the name of the field).
//
// Error response Example:
//   {name: ['não pode estar em banco'], email: ['formato inválido']}
//
//
// Usage:
//   > formComponent = new Form('*[form-selector]', {name_scope: 'transaction'});
//

(function(){

  var Form = function (form, options) {

    var self = this;

    self.form = $(form);

    options || (options = {});

    self.options = $.extend({
      name_scope: '',
      scrollToError: false
    }, options);


    self.showErrors = function(error_object) {
      self.removeErrors();
      for (var key in error_object) {
        var error = error_object[key];
        if (error.constructor == Object) {
          for (var k in error) {
            var fieldName;
            if (self.options.name_scope != '') {
              fieldName = self.options.name_scope+'['+key+']['+k+']';
            } else {
              fieldName = key+'['+k+']';
            }
            self.showErrorFor(fieldName, error[k][0])
          }
        } else {
          var fieldName;
          if (self.options.name_scope != '') {
            fieldName = self.options.name_scope+'['+key+']';
          } else {
            fieldName = key
          }
          self.showErrorFor(fieldName, error[0])
        }
      }
      if (self.options.scrollToError) {
        var $firstError = $('*.error:visible:first', self.form);
        if ($firstError.size()) {
          $.scrollTo($firstError, {duration: 300, easing: 'easeOutBack', offset: {top: -60}});
        }
      }
    }



    self.showErrorFor = function(fieldName, errorMessage) {
      var $input = $('*[name="'+fieldName+'"]:visible, *[data-form-field="'+fieldName+'"]:visible', self.form),
          $error = $('*[data-error="'+fieldName+'"]', self.form);

      if ($error.size() > 0) {
        $error.html(errorMessage);
      } else {
        $input.after("<span class='error-message' data-error='"+fieldName+"'>"+errorMessage+'</span>')
      }
      $input.addClass('error');
      $input.parent().addClass('with-error');

      $input.off('blur.Form:removeError').on('blur.Form:removeError', function() {
        if ($(this).val().length > 0) {
          $input.trigger('form:removeError')
        }
      });

      $input.off('form:removeError').on('form:removeError', function() {
        var $parent = $(this).parents('.with-error:first');
        $('*[data-error]', $parent).remove();
        $parent.removeClass('with-error');
        $(this).removeClass('error');
        $(this).off('blur.removeError');
      })
    }



    self.removeErrors = function() {
      $('*[data-error]', self.form).remove();
      $('.with-error', self.form).removeClass('with-error');
      $('.error', self.form).removeClass('error');
    }



    //  Just remove the errors before a submit.
    //
    self.form.on('submit.Form', function(e) {
      self.removeErrors()
    });



    $('*[type=submit][keep-adding]', self.form).on('click.Form:keep-adding', function(e) {
      self.form.data('keep-adding', true);
    });



    self.form.on('ajax:complete.Form:keep-adding', function() {
      self.form.data('keep-adding', null);
    });



    // This is where the magic starts.
    // Here we listen to the Rails.js ajax:error event.
    //
    self.form.on('ajax:error.Form', function(e, data){
      if (e.target == self.form[0])
        self.showErrors(data.responseJSON)
    });



    // External API events
    //
    self.form.on('form:removeErrors', function() {
      self.removeErrors()
    }).
    on('form:showErrors', function(event, errors) {
      self.showErrors(errors)
    }).
    on('form:showErrorFor', function(event, fieldName, errorMessage) {
      self.showErrorFor(fieldName, errorMessage)
    });



    // Focus / Blur behaviour
    //
    $('input, select, textarea', self.form).on('focus.Form', function() {
      $(this).parent().addClass('focus')
    }).on('blur.Form', function(){
      $(this).parent().removeClass('focus')
    })

  }

  window.Form = Form

})();

