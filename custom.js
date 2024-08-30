function applyValidation(formSelector, validationRules, validationMessages) {
  $(formSelector).validate({
    rules: validationRules,
    messages: validationMessages,
  });
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve(); // Script already loaded
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function loadRecaptchaScript() {
  return loadScript(
    'https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js'
  );
}

function handleFormSubmission({
  formSelector,
  submitBtnSelector,
  onSuccess = () => {},
  onError = () => {},
}) {
  $(formSelector).submit(function (e) {
    e.preventDefault();
    var form = $(this);

    if (!$('#checkbox').is(':checked') || !$('#checkbox-2').is(':checked')) {
      return;
    }

    if (form.valid()) {
      submitForm();

      function submitForm() {
        var submitBtn = $(submitBtnSelector);
        var btnText = submitBtn.find('.btn-txt');
        submitBtn.attr('disabled', true);
        btnText.text(submitBtn.data('Please wait'));
        var formData = form.serializeArray();

        $.ajax({
          type: 'POST',
          url: 'url',
          data: formData,
          success: function (data) {
            submitBtn.attr('disabled', true);
            btnText.text('Submit');
            onSuccess(data, form);
          },
          error: function (xhr) {
            submitBtn.attr('disabled', false);
            btnText.text('Submit');
            var res = JSON.parse(xhr.responseText);
            onError(res, form);
            console.error(xhr.responseText);
          },
        });
      }
    }
  });
}

function customSuccessHandler(data, form) {
  if (data.status === 200) {
    form.hide();
    $('.w-form-done').show();
    $('.w-form-fail').hide();
  }
}

function customErrorHandler(error, form) {
  $('.w-form-fail').show().html(error.message);
  $('.w-form-done').hide();
}

$(document).ready(function () {
  let styles = `
  label.error {
      color: red;
      line-height: 10px;
      width: 100%;
      padding-left: 5px;
      padding-top: 5px;
      font-size: 12px;
    }
`;

  let styleSheet = $('<style>').prop('type', 'text/css').html(styles);
  $('head').append(styleSheet);

  loadRecaptchaScript().then(() => {
    const IOMarketEmailFormRules = {
      name: 'required',
      companyName: 'required',
      email: {
        required: true,
        email: true,
      },
      contact: 'required',
      topicField: 'required',
      message: 'required',
    };

    const IOMarketEmailFormMessages = {
      fullName: 'Please enter your full name',
      companyName: 'Please enter your Company name',
      contact: 'Please enter your Contact Number',
      email: {
        required: 'Please enter your email address',
        email: 'Please enter a valid email address',
      },
      topicField: 'Please select your Topic',
      message: 'Please enter your message',
    };

    applyValidation(
      '#contactForm',
      IOMarketEmailFormRules,
      IOMarketEmailFormMessages
    );

    handleFormSubmission({
      formSelector: '#contactForm',
      submitBtnSelector: '#submitBtnDapp',
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });
  });
});
