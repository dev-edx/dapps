// common VALIDATION function
function applyValidation(formSelector, validationRules, validationMessages) {
  $(formSelector).validate({
    rules: validationRules,
    messages: validationMessages,
  });
}

// Function to load reCAPTCHA script dynamically
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

// Function to load required scripts for reCAPTCHA and validation
function loadRecaptchaScript() {
  return loadScript(
    'https://www.google.com/recaptcha/api.js?render=6LfKA5cpAAAAACymaxeLSh_tF6oBIZYIqMOhBFYj'
  ).then(() => {
    return loadScript(
      'https://cdnjs.cloudflare.com/ajax/libs/jquery-validate/1.19.3/jquery.validate.min.js'
    );
  });
}

function getDateFormate(createDate) {
  let createdAtDate = new Date(createDate);
  let options = { year: 'numeric', month: 'long', day: 'numeric' };
  createdAtDate = createdAtDate.toLocaleDateString('en-US', options);
  return createdAtDate;
}

// common SUBMIT function
function handleFormSubmission({
  formSelector,
  submitBtnSelector,
  optionalFields = [],
  onSuccess = () => {},
  onError = () => {},
}) {
  $(formSelector).submit(function (e) {
    e.preventDefault();
    var form = $(this);

    if (form.valid()) {
      if (formSelector !== '#subscribe-email-Form') {
        grecaptcha.ready(function () {
          grecaptcha
            .execute('6LfKA5cpAAAAACymaxeLSh_tF6oBIZYIqMOhBFYj', {
              action: 'validate_captcha',
            })
            .then(function (token) {
              if (formSelector === '#validator-email-form') {
                form.append(
                  '<input id="queryType" type="hidden" name="queryType" value="4">'
                );
              }
              if (token) {
                form.append(
                  '<input id="g-recaptcha-response" type="hidden" name="g-recaptcha-response" value="' +
                    token +
                    '">'
                );
                submitForm(token);
              } else {
                console.error('reCAPTCHA token is empty or expired');
              }
            })
            .catch(function (error) {
              console.error('Error in obtaining reCAPTCHA token:', error);
            });
        });
      } else {
        form.append('<input type="hidden" name="serviceName" value="website">');
        submitForm();
      }

      function submitForm(token) {
        var url = form.attr('action');
        var submitBtn = $(submitBtnSelector);
        var btnText = submitBtn.find('.btn-txt');
        submitBtn.attr('disabled', true);
        btnText.text(submitBtn.data('Please wait'));
        // Serialize form data
        var formData = form.serializeArray();
        // Remove empty optional fields
        optionalFields.forEach(function (fieldName) {
          // console.log('fieldName', fieldName);
          var field = $('#' + fieldName).val();
          if (!field) {
            formData = formData.filter(function (item) {
              return item.name !== fieldName;
            });
          }
        });
        $.ajax({
          type: 'POST',
          url: url,
          data: formData,
          success: function (data) {
            submitBtn.attr('disabled', true);
            btnText.text('Submit');
            $('#g-recaptcha-response').remove();
            onSuccess(data, form);
          },
          error: function (xhr) {
            submitBtn.attr('disabled', false);
            btnText.text('Submit');
            $('#g-recaptcha-response').remove();
            var res = JSON.parse(xhr.responseText);
            onError(res, form);
            console.error(xhr.responseText);
          },
        });
      }
    }
  });
}
// common SUCCESS and ERROR handlers
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
// common reset FORM
function resetForm(formSelector) {
  $(formSelector).show(); // Show the form
  $(formSelector).validate().resetForm(); // Reset validation state
  $('.w-form-done').hide(); // Hide the error message
  $('.w-form-fail').hide(); // Hide the success message
  $(formSelector).trigger('reset'); // Reset the form fields
}

$(document).ready(function () {
  // Dapps API Calling
  if (document.querySelector('.DAppsBody')) {
    function gRSY(e) {
      let t = Math.floor(e),
        a = t < e,
        s = '';
      for (let i = 1; i <= 5; i++)
        i <= t
          ? (s +=
              '<img src="https://edexa-portal-beta.s3.ap-south-1.amazonaws.com/edexanetwork/images/full-89.svg" />')
          : i == t + 1 && !0 == a
          ? (s +=
              '<img src="https://edexa-portal-beta.s3.ap-south-1.amazonaws.com/edexanetwork/images/Group+89.svg" />')
          : (s +=
              '<img src="https://edexa-portal-beta.s3.ap-south-1.amazonaws.com/edexanetwork/images/Path+102.svg" />');
      return s;
    }

    function gSDap(e) {
      let singleAppId = e;
      console.log('singleAppId', singleAppId);
      let t = new URL(
          'https://edexawebsiteapi.io-world.com/marketplace/DApps/' + e
        ),
        a = new XMLHttpRequest();
      a.open('GET', t, !0),
        (a.onload = function () {
          let e = JSON.parse(this.response);
          document.getElementById('list-of-platforms');
          if (a.status >= 200 && a.status < 400) {
            //e.data.forEach((e) => {
            $('.enjoy-dApp-btn').attr('id', 'enjoy_app_' + e.data.id),
              $(document).on('click', '#enjoy_app_' + e.data.id, function () {
                $('#DAppsListItem').val(e.data.id);
              });
            $(document).on('click', '#demoRequest_' + e.data.id, function () {
              $('#requestDAppid').val(e.data.id);
            });
            if (e.data.name == 'Universe') {
              $('.available-on-title').addClass('d-none');
              $('.universe-title').removeClass('d-none');
            } else {
              $('.universe-title').addClass('d-none');
              $('.available-on-title').removeClass('d-none');
            }
            (document.getElementsByClassName(
              'dapp-start-images-popup'
            )[0].innerHTML = gRSY(e.data.rating)),
              (document.getElementsByClassName(
                'total-number-users-popup'
              )[0].innerHTML = '(' + e.data.totalUser + ')');
            document.getElementsByClassName('dapp-app-image-popup')[0].src =
              e.data.logoIcon;
            let featureList =
              document.getElementsByClassName('features-lists')[0];
            featureList.innerHTML = '';
            e.data.features.forEach((features) => {
              featureList.innerHTML +=
                `<div class="feature-list"><div class="html-embed-9 w-embed"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" class="svg-inline--fa fa-check fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div><div class="text-block-39">` +
                features +
                `</div></div>`;
            });

            let a = document.getElementsByClassName('list-of-platforms')[0];
            (a.innerHTML = ''),
              e.data.availableOn &&
                e.data.availableOn.forEach((t) => {
                  'Demo Request' == t.name
                    ? (a.innerHTML +=
                        '<div class="platform" id=demoRequest_' +
                        e.data.id +
                        '><a href="#" target="_blank" class="link-app-url w-inline-block" ><div class="html-embed-8 w-embed avail-icon">' +
                        t.icon +
                        '</div><h6 class="heading-45 avail-title">' +
                        t.name +
                        '</h6></a></div>')
                    : (a.innerHTML +=
                        '<div class="platform" ><a href="' +
                        t.url +
                        '" target="_blank" class="link-app-url w-inline-block"><div class="html-embed-8 w-embed avail-icon">' +
                        t.icon +
                        '</div><h6 class="heading-45 avail-title">' +
                        t.name +
                        '</h6></a></div>');
                });
            document.getElementsByClassName(
              'dapp-heading-title-popup'
            )[0].textContent = e.data.name;
            document.getElementsByClassName('dapp-content-popup')[0].innerHTML =
              e.data.description;
            //})
          } else {
            getSingleAppFromArray = singleDaapStaticResponse;
            getSIngleArray = getSingleAppFromArray[singleAppId];

            $('.enjoy-dApp-btn').attr('id', 'enjoy_app_' + getSIngleArray.id),
              $(document).on(
                'click',
                '#enjoy_app_' + getSIngleArray.id,
                function (t) {
                  $('#DAppsListItem').val(getSIngleArray.id);
                }
              ),
              $(document).on(
                'click',
                '#demoRequest_' + getSIngleArray.id,
                function (t) {
                  $('#requestDAppid').val(getSIngleArray.id);
                }
              ),
              (document.getElementsByClassName(
                'dApp-start-images-popup'
              )[0].innerHTML = gRSY(getSIngleArray.rating)),
              (document.getElementsByClassName(
                'total-number-users-popup'
              )[0].innerHTML = '(' + getSIngleArray.totalUser + ')');
            document.getElementsByClassName('dApp-app-image-popup')[0].src =
              getSIngleArray.logoIcon;
            let featureList =
              document.getElementsByClassName('features-lists')[0];
            featureList.innerHTML = '';
            getSIngleArray.features.forEach((features) => {
              featureList.innerHTML +=
                `<div class="feature-list"><div class="html-embed-9 w-embed"><svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="check" class="svg-inline--fa fa-check fa-w-16 " role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path></svg></div><div class="text-block-39">` +
                features +
                `</div></div>`;
            });

            let a = document.getElementsByClassName('list-of-platforms')[0];
            (a.innerHTML = ''),
              getSIngleArray.availableOn &&
                getSIngleArray.availableOn.forEach((t) => {
                  'Demo Request' == t.name
                    ? (a.innerHTML +=
                        '<div class="platform" id=demoRequest_' +
                        e.id +
                        '><a href="#" target="_blank" class="link-app-url w-inline-block" ><div class="html-embed-8 w-embed avail-icon">' +
                        t.icon +
                        '</div><h6 class="heading-45 avail-title">' +
                        t.name +
                        '</h6></a></div>')
                    : (a.innerHTML +=
                        '<div class="platform" ><a href="' +
                        t.url +
                        '" target="_blank" class="link-app-url w-inline-block"><div class="html-embed-8 w-embed avail-icon">' +
                        t.icon +
                        '</div><h6 class="heading-45 avail-title">' +
                        t.name +
                        '</h6></a></div>');
                });
            document.getElementsByClassName(
              'DApp-heading-title-popup'
            )[0].textContent = getSIngleArray.name;
            document.getElementsByClassName(
              'DApp-content-popup'
            )[0].textContent = getSIngleArray.description;
          }
        }),
        a.send(),
        $(document).on('click', '#' + e, function (e) {
          e.preventDefault();
          $('.popup-apps-informations').css('display', 'flex'),
            (document
              .querySelector('.popup-apps-informations')
              .animate(
                { opacity: [0, 1] },
                { duration: 600, iterations: 1, easing: 'ease-in' }
              ).onfinish = (e) => {
              e.target.effect.target.style.opacity = 1;
            });
        }),
        $(document).on('click', '#demoRequest_' + e, function (e) {
          $('.DApp-popup-onrequest-form').css('display', 'flex'),
            (document
              .querySelector('.DApp-popup-onrequest-form')
              .animate(
                { opacity: [0, 1] },
                { duration: 600, iterations: 1, easing: 'ease-in' }
              ).onfinish = (e) => {
              e.target.effect.target.style.opacity = 1;
            });
        });
    }

    // Dapps API Calling
    function getDappsTable() {
      let newsUrl = new URL(
        'https://edexawebsiteapi.io-world.com/marketplace/DApps'
      );
      let request = new XMLHttpRequest();
      let url = newsUrl;
      request.open('GET', url, true);
      request.onload = function () {
        let data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
          data.data.data.forEach((singleDApp) => {
            let publicPrivateIcon = '';
            if (singleDApp.blckChnAvailability == 0) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l362.8 0c-5.4-9.4-8.6-20.3-8.6-32l0-128c0-2.1 .1-4.2 .3-6.3c-31-26-71-41.7-114.6-41.7l-91.4 0zM528 240c17.7 0 32 14.3 32 32l0 48-64 0 0-48c0-17.7 14.3-32 32-32zm-80 32l0 48c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80z"/></svg>';
            } else if (singleDApp.blckChnAvailability == 1) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>';
            } else if (singleDApp.blckChnAvailability == 2) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l362.8 0c-5.4-9.4-8.6-20.3-8.6-32l0-128c0-2.1 .1-4.2 .3-6.3c-31-26-71-41.7-114.6-41.7l-91.4 0zM528 240c17.7 0 32 14.3 32 32l0 48-64 0 0-48c0-17.7 14.3-32 32-32zm-80 32l0 48c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80z"/></svg> / <svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>';
            }
            let statusDetail = 'activated';
            if (singleDApp.status == 0) {
              statusDetail = 'deactivated';
            }
            let DAppBody =
              `<tr class="app_` +
              singleDApp.id +
              `" id="` +
              singleDApp.id +
              `"><td class="singleAppName"><img src="` +
              singleDApp.logoIcon +
              `" width="35px" height="35px" class="DApp-image">` +
              singleDApp.name +
              `</td><td>` +
              singleDApp.categoryName +
              `</td><td>` +
              publicPrivateIcon +
              `</td><td>-</td><td class="singleAppName">` +
              gRSY(singleDApp.rating) +
              `</td><td><span class="` +
              statusDetail +
              `">â—</span></td></tr>`;
            $('.DAppsBody').append($(DAppBody));
            $('#DAppsListItem').append(
              '<option value="' +
                singleDApp.id +
                '">' +
                singleDApp.name +
                '</option>'
            );
            $(document).ready(function () {
              $('.app_' + singleDApp.id).on('click', function () {
                gSDap(singleDApp.id);
              });
            });
          });
          data.data.requestedData.forEach((singleDApp) => {
            let publicPrivateIcon = '';
            if (singleDApp.blckChnAvailability == 0) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l362.8 0c-5.4-9.4-8.6-20.3-8.6-32l0-128c0-2.1 .1-4.2 .3-6.3c-31-26-71-41.7-114.6-41.7l-91.4 0zM528 240c17.7 0 32 14.3 32 32l0 48-64 0 0-48c0-17.7 14.3-32 32-32zm-80 32l0 48c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80z"/></svg>';
            } else if (singleDApp.blckChnAvailability == 1) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>';
            } else if (singleDApp.blckChnAvailability == 2) {
              publicPrivateIcon =
                '<svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l362.8 0c-5.4-9.4-8.6-20.3-8.6-32l0-128c0-2.1 .1-4.2 .3-6.3c-31-26-71-41.7-114.6-41.7l-91.4 0zM528 240c17.7 0 32 14.3 32 32l0 48-64 0 0-48c0-17.7 14.3-32 32-32zm-80 32l0 48c-17.7 0-32 14.3-32 32l0 128c0 17.7 14.3 32 32 32l160 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32l0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80z"/></svg> / <svg xmlns="http://www.w3.org/2000/svg" height="14" width="17.5" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="#ffffff" d="M96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3zM609.3 512l-137.8 0c5.4-9.4 8.6-20.3 8.6-32l0-8c0-60.7-27.1-115.2-69.8-151.8c2.4-.1 4.7-.2 7.1-.2l61.4 0C567.8 320 640 392.2 640 481.3c0 17-13.8 30.7-30.7 30.7zM432 256c-31 0-59-12.6-79.3-32.9C372.4 196.5 384 163.6 384 128c0-26.8-6.6-52.1-18.3-74.3C384.3 40.1 407.2 32 432 32c61.9 0 112 50.1 112 112s-50.1 112-112 112z"/></svg>';
            }
            let statusDetail = 'activated';
            if (singleDApp.status == 0) {
              statusDetail = 'deactivated';
            }
            let DAppBody =
              `<tr class="app_` +
              singleDApp.id +
              `" id="` +
              singleDApp.id +
              `"><td class="singleAppName"><img src="` +
              singleDApp.logoIcon +
              `" width="35px" height="35px" class="DApp-image">` +
              singleDApp.name +
              `</td><td>` +
              singleDApp.categoryName +
              `</td><td>` +
              publicPrivateIcon +
              `</td><td><img src="images/arrow-right-up.svg" loading="lazy" id="w-node-fa2767f4-10ae-2b60-fae8-e7da0e711c43-9c8160e9" alt="" class="image-39"></td><td class="singleAppName">` +
              gRSY(singleDApp.rating) +
              `</td><td><span class="` +
              statusDetail +
              `">â—</span></td></tr>`;
            $('.DAppsBody').append($(DAppBody));
            $('#DAppsListItem').append(
              '<option value="' +
                singleDApp.id +
                '">' +
                singleDApp.name +
                '</option>'
            );
            $(document).ready(function () {
              $('.app_' + singleDApp.id).on('click', function () {
                gSDap(singleDApp.id);
              });
            });
          });
        }
      };

      request.send();
    }

    getDappsTable();

    function generateSliderHtml(e) {
      return `
        <div id="trending-apps-sliders" class="trending-apps-sliders">
            <div class="slider-details">
                <div class="slider-image">
                    <img loading="lazy" src="${
                      e.logoIconBig
                    }" class="slider-image-logo">
                </div>
                <div class="slider-content">
                    <div class="slider-content-top">
                        <div class="left-content">
                            <div class="tranding-btn">
                                <img src="https://uploads-ssl.webflow.com/627394d54eece8c34647251a/630c73a4b066bf6a07c3b511_noun-star-115205.svg" class="image-36">
                                <div class="text-block-34">MOST TRENDING</div>
                            </div>
                        </div>
                        <div class="right-content">
                            <div class="start-images">
                                ${gRSY(e.rating)}
                            </div>
                            <div class="text-block-35 slider-content-top-users">
                                (${e.totalUser})
                            </div>
                        </div>
                    </div>
                    <div class="slider-content-middle">
                        <h2 class="slider-title-text">${e.name}</h2>
                        <p class="slider-content-paragraph">${e.description.substring(
                          0,
                          260
                        )}...</p>
                    </div>
                    <div class="slider-content-bottom">
                        <div class="left-content">
                            <div class="w-layout-grid grid-30">
                                <a data-id="${
                                  e.id
                                }" href="#" class="view-details btnmain font-16 w-button rm-mp">View details</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    let edexaTopThreeDAppUrl = new URL(
      'https://edexawebsiteapi.io-world.com/marketplace/trending-DApps'
    );

    function gTTDap() {
      let e = new XMLHttpRequest();
      e.open('GET', edexaTopThreeDAppUrl, true);
      e.onload = function () {
        let t = JSON.parse(this.response);
        if (e.status >= 200 && e.status < 400) {
          $('.loder').css('display', 'none');
          t.data.data.forEach((e) => {
            $('.single-item').slick('slickAdd', generateSliderHtml(e));
          });
        }
        $('.loder').css('display', 'none');
      };
      e.send();
      $(document).on('click', '[id^=view-details-]', function (e) {
        e.preventDefault();
        $('.popup-apps-informations').css('display', 'flex');
        document
          .querySelector('.popup-apps-informations')
          .animate(
            { opacity: [0, 1] },
            { duration: 600, iterations: 1, easing: 'ease-in' }
          ).onfinish = (animationEvent) => {
          animationEvent.target.effect.target.style.opacity = 1;
        };
      });
    }

    gTTDap();

    // commenting out as the error of dapps form is not opening
    // $('.slider').slick({
    //   infinite: true,
    //   arrows: false,
    //   dots: false,
    //   autoplay: false,
    //   speed: 800,
    //   slidesToShow: 1,
    //   slidesToScroll: 1,
    // });
    //ticking machine
    var percentTime;
    var tick;
    var time = 0.1;
    var progressBarIndex = 0;
    $('.progressBarContainer .progressBar').each(function (index) {
      var progress = "<div class='inProgress inProgress" + index + "'></div>";
      $(this)(progress);
    });
    function startProgressbar() {
      resetProgressbar();
      percentTime = 0;
      tick = setInterval(interval, 10);
    }
    function interval() {
      if (
        $(
          '.slider .slick-track div[data-slick-index="' +
            progressBarIndex +
            '"]'
        ).attr('aria-hidden') === 'true'
      ) {
        progressBarIndex = $(
          '.slider .slick-track div[aria-hidden="false"]'
        ).data('slickIndex');
        startProgressbar();
      } else {
        percentTime += 1 / (time + 5);
        $('.inProgress' + progressBarIndex).css({
          width: percentTime + '%',
        });
        if (percentTime >= 100) {
          $('.single-item').slick('slickNext');
          progressBarIndex++;
          if (progressBarIndex > 2) {
            progressBarIndex = 0;
          }
          startProgressbar();
        }
      }
    }
    function resetProgressbar() {
      $('.inProgress').css({
        width: 0 + '%',
      });
      clearInterval(tick);
    }
    startProgressbar();
    // End ticking machine
    $('.item').click(function () {
      clearInterval(tick);
      var goToThisIndex = $(this).find('div').data('slickIndex');
      $('.single-item').slick('slickGoTo', goToThisIndex, false);
      startProgressbar();
    });
  }

  // News Listing API Calling
  if (document.querySelector('.latest-news-list-2')) {
    $.urlParam = function (name) {
      let results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
        window.location.href
      );
      if (results == null) {
        return null;
      }
      return decodeURI(results[1]) || 0;
    };

    function getAllNews() {
      $('.loder').css('display', 'flex');
      let newsUrl = new URL('https://edexawebsiteapi.io-world.com/blogs');
      let request = new XMLHttpRequest();
      let url = newsUrl;
      request.open('GET', url, true);
      request.onload = function () {
        let data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
          $('.loder').css('display', 'none');
          localStorage.setItem('total_records', data.data.generalBlog.length);
          let singleBigNews = data.data.generalBlog.slice(0, 1);
          singleBigNews.forEach((singlenews) => {
            let template =
              `<a data-w-id="95b18c90-617f-a856-0480-b5f0f81bce34" href="https://work.edexa.network/news-detail?title=` +
              singlenews.title.split(' ').join('-') +
              `&id=` +
              singlenews.id +
              `" class="link-block-14 w-inline-block">
                <div class="news-content">
                  <div class="news-content-image-div-2"><img src="` +
              singlenews.blogImage +
              `" loading="lazy" sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, (max-width: 991px) 92vw, (max-width: 1439px) 438.46875px, 668px" srcset="` +
              singlenews.blogImage +
              ` 500w, ` +
              singlenews.blogImage +
              ` 800w, ` +
              singlenews.blogImage +
              ` 1080w, ` +
              singlenews.blogImage +
              ` 1600w, ` +
              singlenews.blogImage +
              ` 1920w" alt="" class="news-content-img-2">
                    <h6 class="news-content-heading-title-2">` +
              singlenews.category.name +
              `</h6>
                  </div>
                  <div class="news-date-time">
                    <h5 class="news-heading-5-2">` +
              getDateFormate(singlenews.publishedAt) +
              `</h5>
                  </div>
                  <div class="news-title">
                    <h3 class="heading-3-news">` +
              singlenews.title +
              `</h3>
                  </div>
                  <div class="news-content-description">
                    <div class="text-block-66">` +
              singlenews.shortDescription.substr(0, 250) +
              `...</div>
                  </div>
                </div>
              </a>`;
            $('.grid-mix-news-2').prepend($(template));
          });
          let threeSmallNews = data.data.generalBlog.slice(1, 4);
          threeSmallNews.forEach((singlenewsfromThreeNews) => {
            let template2 =
              `<a href="https://work.edexa.network/news-detail?title=` +
              singlenewsfromThreeNews.title.split(' ').join('-') +
              `&id=` +
              singlenewsfromThreeNews.id +
              `" class="link-block-16 w-inline-block">
                  <div class="news-content-small-2">
                    <div class="news-content-small-image-2"><img src="` +
              singlenewsfromThreeNews.blogImage +
              `" loading="lazy" sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, (max-width: 991px) 92vw, (max-width: 1439px) 172.84375px, 281.5625px" srcset="` +
              singlenewsfromThreeNews.blogImage +
              ` 500w, ` +
              singlenewsfromThreeNews.blogImage +
              ` 800w, ` +
              singlenewsfromThreeNews.blogImage +
              ` 1080w, ` +
              singlenewsfromThreeNews.blogImage +
              ` 1600w, ` +
              singlenewsfromThreeNews.blogImage +
              ` 1640w" alt="" class="news-content-small-img-2">
                      <h6 class="heading-195">` +
              singlenewsfromThreeNews.category.name +
              `</h6>
                    </div>
                    <div class="news-content-small-contents-2">
                      <div class="news-content-small-date-time">
                        <h5 class="heading-8-samll-news-3">` +
              getDateFormate(singlenewsfromThreeNews.publishedAt) +
              `</h5>
                      </div>
                      <div class="news-content-small-title">
                        <h3 class="heading-7-samll-news-3">` +
              singlenewsfromThreeNews.title +
              `</h3>
                      </div>
                      <div class="news-content-small-contents-description">
                        <div class="text-block-67">` +
              singlenewsfromThreeNews.shortDescription.substr(0, 150) +
              `...</div>
                      </div>
                    </div>
                  </div>
                </a>`;
            $('.grid-small-news-2').prepend($(template2));
          });
        }
      };

      request.send();
    }

    getAllNews();

    $(document).ready(function () {
      let pagenum = 1;
      createpagination(pagenum);
      fetch_data(pagenum);
    });

    function createpagination(pagenum) {
      $('#page_container').html('');

      if (pagenum == 1) {
        $('#page_container').append(
          "<li class='page-item disabled previous'><a href='javascript:void(0)' class='page-link'><</a></li>"
        );
      } else {
        $('#page_container').append(
          "<li class='page-item' onclick='makecall(" +
            (pagenum - 1) +
            ")'><a href='javascript:void(0)' class='page-link'><</a></li>"
        );
      }

      let total_records = localStorage.getItem('total_records');
      let perpage = 5;
      let total_pages = Math.ceil(total_records / perpage);

      let i = 0;
      for (i = 0; i <= 5; i++) {
        if (pagenum == pagenum + i) {
          $('#page_container').append(
            "<li class='page-item disabled'><a href='javascript:void(0)' class='page-link'>" +
              (pagenum + i) +
              '</a></li>'
          );
        } else {
          if (pagenum + i <= total_pages) {
            $('#page_container').append(
              "<li class='page-item' onclick='makecall(" +
                (pagenum + i) +
                ")'><a href='javascript:void(0)' class='page-link'>" +
                (pagenum + i) +
                '</a></li>'
            );
          }
        }
      }

      if (pagenum == total_pages) {
        $('#page_container').append(
          "<li class='page-item disabled'><a href='javascript:void(0)' class='page-link'>></a></li>"
        );
      } else {
        $('#page_container').append(
          `<li class='page-item next' onclick='${makecall(
            pagenum + 1
          )}'><a href='javascript:void(0)' class='page-link'>></a></li>`
        );
      }
    }

    function fetch_data(pagenum) {
      $('.pagination-div').css('display', 'flex');
      $.ajax({
        type: 'get',
        url:
          'https://edexawebsiteapi.io-world.com/blogs?limit=5&page=' + pagenum,
        dataType: 'json',
        success: function (data) {
          /*if (data.data.generalBlog.length <= perpage) {
                      $(".pagination-div").css('display','none');
                    }else{
                      $(".pagination-div").css('display','flex');
                    }*/

          $('.latest-news-list-2').html('');
          data.data.generalBlog.forEach((latestNewsSingleNews) => {
            let template3 =
              `<a href="https://work.edexa.network/news-detail?title=` +
              latestNewsSingleNews.title.split(' ').join('-') +
              `&id=` +
              latestNewsSingleNews.id +
              `" class="link-block-15 w-inline-block">
                  <div data-w-id="335d0e66-bdae-01a3-d690-538783c710ed" class="latest-news-item-2">
                    <div class="latest-news-item-image-3"><img src="` +
              latestNewsSingleNews.blogImage +
              `" loading="lazy" sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, (max-width: 991px) 32vw, (max-width: 1439px) 317.484375px, 488.140625px" srcset="` +
              latestNewsSingleNews.blogImage +
              ` 500w, ` +
              latestNewsSingleNews.blogImage +
              ` 800w, ` +
              latestNewsSingleNews.blogImage +
              ` 1080w, ` +
              latestNewsSingleNews.blogImage +
              ` 1600w, ` +
              latestNewsSingleNews.blogImage +
              ` 1640w" alt="" class="latest-news-item-image-single-2">
                      <h6 class="latest-news-item-image-single-title-2">` +
              latestNewsSingleNews.category.name +
              `</h6>
                    </div>
                    <div class="latest-news-item-content">
                      <div class="latest-news-item-date-time">
                        <h5 class="heading-11latest-news-item-3">` +
              getDateFormate(latestNewsSingleNews.createdAt) +
              `</h5>
                      </div>
                      <div class="latest-news-item-title">
                        <h2 class="heading-10-latest-news-item-3">` +
              latestNewsSingleNews.title +
              `</h2>
                      </div>
                      <div class="latest-news-item-description">
                        <div class="text-block-68">` +
              latestNewsSingleNews.shortDescription +
              `</div>
                      </div>
                    </div>
                  </div>
                </a>`;
            $('.latest-news-list-2').append($(template3));
          });
          if (data.data.generalBlog.length == 0) {
            $('.latest-news-list-2').html(
              "<div style='text-align: center;'>No data Found......!</div>"
            );
            $('.pagination-div').css('display', 'none');
          } else {
            $('.pagination-div').css('display', 'flex');
          }
        },
        error: function () {
          $('.latest-news-list-2').html(
            "<div style='text-align: center;'>No data Found......!</div>"
          );
          $('.pagination-div').css('display', 'none');
        },
      });
    }

    function makecall(pagenum) {
      createpagination(pagenum);
      fetch_data(pagenum);
    }

    $(document).ready(function () {
      $('#searchNewsName').on('keyup', function () {
        searchAPI(this.value);
      });
    });

    function searchAPI(searchText) {
      $('.loder').css('display', 'flex');
      $('.pagination-div').css('display', 'flex');
      var perpage = 4;
      var pagenum = 1;
      if (searchText == '') {
        $('.latest-news-list-2').html('');
        createpagination(pagenum);
        fetch_data(perpage, pagenum);
        $('.pagination-div').css('display', 'flex');
        $('.loder').css('display', 'none');
      }
      $.ajax({
        type: 'get',
        url: 'https://edexawebsiteapi.io-world.com/blogs?search=' + searchText,
        dataType: 'json',
        success: function (data) {
          $('.loder').css('display', 'none');

          if (data.data.generalBlog.length <= perpage) {
            $('.pagination-div').css('display', 'none');
          } else {
            $('.pagination-div').css('display', 'flex');
          }

          createpagination(pagenum);
          $('.latest-news-list-2').html('');
          data.data.generalBlog.forEach((latestNewsSingleNews) => {
            var template4 =
              `<a href="https://work.edexa.network/news-detail?title=` +
              latestNewsSingleNews.title.split(' ').join('-') +
              `&id=` +
              latestNewsSingleNews.id +
              `" class="link-block-15 w-inline-block">
              <div data-w-id="335d0e66-bdae-01a3-d690-538783c710ed" class="latest-news-item-2">
                <div class="latest-news-item-image-3"><img src="` +
              latestNewsSingleNews.blogImage +
              `" loading="lazy" sizes="(max-width: 479px) 83vw, (max-width: 767px) 90vw, (max-width: 991px) 32vw, (max-width: 1439px) 317.484375px, 488.140625px" srcset="` +
              latestNewsSingleNews.blogImage +
              ` 500w, ` +
              latestNewsSingleNews.blogImage +
              ` 800w, ` +
              latestNewsSingleNews.blogImage +
              ` 1080w, ` +
              latestNewsSingleNews.blogImage +
              ` 1600w, ` +
              latestNewsSingleNews.blogImage +
              ` 1640w" alt="" class="latest-news-item-image-single-2">
                  <h6 class="latest-news-item-image-single-title-2">` +
              latestNewsSingleNews.category.name +
              `</h6>
                </div>
                <div class="latest-news-item-content">
                  <div class="latest-news-item-date-time">
                    <h5 class="heading-11latest-news-item-3">` +
              getDateFormate(latestNewsSingleNews.createdAt) +
              `</h5>
                  </div>
                  <div class="latest-news-item-title">
                    <h2 class="heading-10-latest-news-item-3">` +
              latestNewsSingleNews.title +
              `</h2>
                  </div>
                  <div class="latest-news-item-description">
                    <div class="text-block-68">` +
              latestNewsSingleNews.shortDescription +
              `</div>
                  </div>
                </div>
              </div>
            </a>`;
            $('.latest-news-list-2').append($(template4));
          });

          if (data.data.generalBlog.length == 0) {
            $('.latest-news-list-2').html(
              "<div style='text-align: center;'>No data Found......!</div>"
            );
          }
        },
        error: function () {
          $('.latest-news-list-2').html(
            "<div style='text-align: center;'>No data Found......!</div>"
          );
          $('.pagination-div').css('display', 'none');
        },
      });
    }
  }

  // News Details API Calling
  if (document.querySelector('.full-news')) {
    $.urlParam = function (name) {
      let results = new RegExp('[?&]' + name + '=([^&#]*)').exec(
        window.location.href
      );
      if (results == null) {
        return null;
      }
      return decodeURI(results[1]) || 0;
    };

    function getSingleNews() {
      let newsUrl = new URL(
        'https://edexawebsiteapi.io-world.com/blogs/' + $.urlParam('id')
      );
      let request = new XMLHttpRequest();
      let url = newsUrl;
      request.open('GET', url, true);
      request.onload = function () {
        let data = JSON.parse(this.response);
        if (request.status >= 200 && request.status < 400) {
          if (data.data.id == '63fe02d7a7836a8dda5a472e') {
            $('.timeline-section').css('display', 'block');
          }
          //var singleBigNews = data.data.slice(0, 1);
          //singleBigNews.forEach(singlenews =>{
          let template =
            `<div class="back-button-2">
            <a href="news" class="link-block-2-single-news w-inline-block">
              <h1 class="heading-196">â† Back to News</h1>
            </a>
          </div>
          <div class="single-blog-title">
            <h1 class="heading-5-single-news">` +
            data.data.title +
            `</h1>
          </div>
          <div class="date-time-share-icons">
            <div class="date-time">
              <h5 class="heading-6-single-news">` +
            getDateFormate(data.data.publishedAt) +
            `</h5>
            </div>
            <div class="share-icons">
              <a href="https://www.facebook.com/sharer.php?u=https://edexa.network/news-detail?title=` +
            data.data.title.split(' ').join('-') +
            `&id=` +
            data.data.id +
            `" class="share-link w-inline-block"><img src="images/Path-4206.svg" loading="lazy" alt="" class="image-2-single-news"></a>
              <a href="https://www.linkedin.com/shareArticle?mini=true&url=https://edexa.network/news-detail?title=` +
            data.data.title.split(' ').join('-') +
            `&id=` +
            data.data.id +
            `" class="share-link w-inline-block"><img src="images/linkedin-in.svg" loading="lazy" alt="" class="image-2-single-news"></a>
              <a href="https://twitter.com/intent/tweet/?text=` +
            data.data.title.split(' ').join('-') +
            `&url=https://edexa.network/news-detail?title=` +
            data.data.title.split(' ').join('-') +
            `&id=` +
            data.data.id +
            `" class="share-link w-inline-block"><img src="images/Path-4211.svg" loading="lazy" alt="" class="image-2-single-news"></a>
            </div>
          </div>
          <div class="blog-single-image"><img src="` +
            data.data.blogImage +
            `" loading="lazy" sizes="(max-width: 479px) 92vw, (max-width: 767px) 95vw, (max-width: 991px) 96vw, (max-width: 1439px) 960px, 1440px" srcset="` +
            data.data.blogImage +
            ` 500w, ` +
            data.data.blogImage +
            ` 800w, ` +
            data.data.blogImage +
            ` 1080w, ` +
            data.data.blogImage +
            ` 1600w, ` +
            data.data.blogImage +
            ` 1640w" alt="" class="single-newmain-image"></div>
          <div class="rich-text-block-single-news w-richtext">` +
            data.data.content +
            `</div>`;
          $('.full-news').prepend($(template));
          // });
        }
      };

      request.send();
    }
    getSingleNews();
  }

  // Blogs API
  if (document.querySelector('.medium-container')) {
    function getMediumBlogs() {
      let blogsUrl = new URL(
        'https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fmedium.com%2Ffeed%2F%40edeXablockchain'
      );
      let request = new XMLHttpRequest();
      let url = blogsUrl;
      request.open('GET', url, true);
      request.onload = function () {
        let data = JSON.parse(this.response);
        console.log('data', data);
        for (let i = 0; i < 3; i++) {
          let title = data.items[i].title;
          let pubDate = data.items[i].pubDate;
          let description = data.items[i].description;
          let today = new Date(pubDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          let link = data.items[i].link;
          let thumbnail = data.items[i].thumbnail;
          if (request.status >= 200 && request.status < 400) {
            let template =
              '<div id="w-node-_1b1966db-b119-78de-99b9-5c33c655e801-c6a952d8" role="listitem" class="collection-item w-dyn-item"><a data-w-id="1b1966db-b119-78de-99b9-5c33c655e802" style="-webkit-transform:translate3d(0, 0px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-moz-transform:translate3d(0, 0px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);-ms-transform:translate3d(0, 0px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);transform:translate3d(0, 0px, 0) scale3d(1, 1, 1) rotateX(0) rotateY(0) rotateZ(0) skew(0, 0);opacity:0" href=" ' +
              link +
              '" class="link-image-blog w-inline-block"><img src="' +
              thumbnail +
              '" loading="lazy" alt="" class="image-blog w-dyn-bind-empty"><div class="bg-blog"></div></a><div data-w-id="1b1966db-b119-78de-99b9-5c33c655e805" style="transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); opacity: 1; transform-style: preserve-3d;" class="block-blog"><div class="date-blog">' +
              today +
              '</div><a href="' +
              link +
              '" class="link-heading-blog w-inline-block"><h6 class="heading-blog">' +
              title +
              '</h6><div class="blogdescription"></div></a><a href=" ' +
              link +
              '" class="blog-button w-button"><strong class="bold-text-61">Read more</strong></a></div></div>';
            $('.medium-container').prepend($(template));
          }
        }
      };
      request.send();
    }

    getMediumBlogs();
  }

  let styles = `
        #subscribe-email-error {
          color: red;
          position: absolute;
          margin-top: 16%;
          font-size: 15px;
          width: 35%
        }
        label.error {
            color: red;
            line-height: 10px;
            width: 100%;
            padding-left: 5px;
            font-size: 12px;
          }
      `;

  // styles
  let styleSheet = $('<style>').prop('type', 'text/css').html(styles);
  $('head').append(styleSheet);

  //   ******************************************************* //
  // 1. Scripts for DAPPS form submission
  loadRecaptchaScript().then(() => {
    //validation scripts
    const dappEmailFormRules = {
      fullName: 'required',
      email: {
        required: true,
        email: true,
      },
      timezone: 'required',
      dAppName: 'required',
      description: 'required',
      blockchain: 'required',
      projectDescription: 'required',
      website: {
        required: true,
        url: true,
      },
    };

    const dappEmailFormMessages = {
      fullName: 'Please enter your full name',
      email: {
        required: 'Please enter your email address',
        email: 'Please enter a valid email address',
      },
      timezone: 'Please select your timezone',
      dAppName: 'Please enter the name of your DApp',
      projectDescription: 'Please enter the Project Description of your DApp',
      description: 'Please enter a description of your DApp',
      blockchain: 'Please enter the blockchain your app is built on',
      website: {
        required: "Please enter the project's official website",
        url: 'Please enter a valid URL for the website',
      },
    };

    // Apply validation to dApp email form
    applyValidation(
      '#dapp-email-form',
      dappEmailFormRules,
      dappEmailFormMessages
    );
    // Apply submit to dApp email form
    handleFormSubmission({
      formSelector: '#dapp-email-form',
      submitBtnSelector: '#submitBtnDapp',
      optionalFields: ['companyName', 'postion', 'nickName'],
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });

    $('#dapp-close-image-2').on('click', function () {
      resetForm('#dapp-email-form');
    });

    //   ******************************************************* //
    // 2. Scripts for VALIDATOR form submission

    //validation scripts
    const validatorFormRules = {
      email: {
        required: true,
        email: true,
      },
      name: 'required',
    };

    const validatorFormMessages = {
      email: {
        required: 'Please enter your email address',
        email: 'Please enter a valid email address',
      },
      name: 'Please Enter your name',
    };

    // Apply validation to validator form
    applyValidation(
      '#validator-email-form',
      validatorFormRules,
      validatorFormMessages
    );

    // Apply submit to validator form
    handleFormSubmission({
      formSelector: '#validator-email-form',
      submitBtnSelector: '#submitBtnDapp',
      optionalFields: ['companyName'],
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });

    $('#validaor-close-image').on('click', function () {
      resetForm('#validator-email-form');
    });

    //   ******************************************************* //
    // 3. Scripts for CONTACT US  form submission

    //validation scripts
    const contactFormRules = {
      companyName: {
        required: true,
        lettersonly: true,
      },
      firstName: {
        required: true,
        lettersonly: true,
      },
      lastName: {
        required: true,
      },
      email: {
        required: true,
        customEmail: true,
      },
      queryType: {
        required: true,
      },
      message: {
        required: true,
        lettersonly: true,
      },
    };

    const contactFormMessages = {
      firstName: {
        required: 'Please enter your First Name',
      },
      companyName: {
        required: 'Please enter Company Name',
      },
      message: {
        required: 'Please enter your Message',
      },
      lastName: {
        required: 'Please enter your Last Name',
      },
      email: {
        required: 'Please enter your Email Address',
      },
    };

    jQuery.validator.addMethod(
      'lettersonly',
      function (value, element) {
        return this.optional(element) || /^[a-z\s]+$/i.test(value);
      },
      'Letters only please!'
    );

    jQuery.validator.addMethod(
      'customEmail',
      function (value, element) {
        return (
          this.optional(element) ||
          /^[_a-z0-9-]+(.[_a-z0-9-\\+]+)@[a-z0-9-]+(.[a-z0-9-]+)(.[a-z]{2,3})$/i.test(
            value
          )
        );
      },
      'Please enter valid email address!'
    );

    // Apply validation to contact us form
    applyValidation(
      '#contact-us-email-form',
      contactFormRules,
      contactFormMessages
    );

    // Apply submit to contact us form
    handleFormSubmission({
      formSelector: '#contact-us-email-form',
      submitBtnSelector: '#submitBtnDapp',
      optionalFields: [],
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });

    $('#contact-us-close-image').on('click', function () {
      resetForm('#contact-us-email-form');
    });

    //   ******************************************************* //
    // 4. Scripts for SUBSCRIBE EMAIL form submission
    //validation scripts
    const subscribeFormRules = {
      email: {
        required: true,
        customEmail: true,
      },
    };

    const subscribeFormMessages = {
      email: {
        required: 'Please enter your Email Address',
        customEmail: 'Please enter valid Email Address',
      },
    };

    // Apply validation to subscribe email form
    applyValidation(
      '#subscribe-email-Form',
      subscribeFormRules,
      subscribeFormMessages
    );

    // Apply submit to subscribe form
    handleFormSubmission({
      formSelector: '#subscribe-email-Form',
      submitBtnSelector: '#submitBtnDapp',
      optionalFields: [],
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });

    //   ******************************************************* //
    // 5. Scripts for BUG BOUNTY  form submission
    //validation scripts
    const bugBountyFormRules = {
      email: {
        required: true,
        customEmail: true,
      },
      firstName: {
        required: true,
        lettersonly: true,
      },
      lastName: {
        required: true,
        lettersonly: true,
      },
      message: {
        required: true,
      },
    };

    const bugBountyFormMessages = {
      email: {
        required: 'Please enter your email address',
        customEmail: 'Please enter a valid email address',
      },
      firstName: {
        required: 'Please enter your first name',
        lettersonly: 'First name must contain only characters',
      },
      lastName: {
        required: 'Please enter your last name',
        lettersonly: 'Last name must contain only characters',
      },
      message: 'Please enter a bug description',
    };

    // Apply validation to subscribe email form
    applyValidation(
      '#bug-bounty-email-Form',
      bugBountyFormRules,
      bugBountyFormMessages
    );

    // Apply submit to subscribe form
    handleFormSubmission({
      formSelector: '#bug-bounty-email-Form',
      submitBtnSelector: '#submitBtnDapp',
      optionalFields: ['companyName'],
      onSuccess: customSuccessHandler,
      onError: customErrorHandler,
    });

    $('#bug-bounty-close-image').on('click', function () {
      resetForm('#bug-bounty-email-Form');
    });
  });
});
