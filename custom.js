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
          console.log('fieldName', fieldName);
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
  var styles = `
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
  var styleSheet = $('<style>').prop('type', 'text/css').html(styles);
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
          /^[_a-z0-9-]+(.[_a-z0-9-\+]+)@[a-z0-9-]+(.[a-z0-9-]+)(.[a-z]{2,3})$/i.test(
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

    // dapps explore apps

    function gRSY(e) {
      var t = Math.floor(e),
        a = t < e,
        s = '';
      for (let i = 1; i <= 5; i++)
        i <= t
          ? (s += '<img src="images/full-89.svg" />')
          : i == t + 1 && !0 == a
          ? (s += '<img src="images/Group 89.svg" />')
          : (s += '<img src="images/Path 102.svg" />');
      return s;
    }

    function gSDap(e) {
      var singleAppId = e;
      let t = new URL('http://192.168.1.131:3000/marketplace/DApps/' + e),
        a = new XMLHttpRequest();
      a.open('GET', t, !0),
        (a.onload = function () {
          let e = JSON.parse(this.response);
          document.getElementById('daaps-Container');
          document.getElementById('list-of-platforms');
          if (a.status >= 200 && a.status < 400) {
            //e.data.forEach((e) => {
            $('.enjoy-dApp-btn').attr('id', 'enjoy_app_' + e.data.id),
              $(document).on('click', '#enjoy_app_' + e.data.id, function (t) {
                $('#DAppsListItem').val(e.data.id);
              });
            $(document).on('click', '#demoRequest_' + e.data.id, function (t) {
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
              'dApp-start-images-popup'
            )[0].innerHTML = gRSY(e.data.rating)),
              (document.getElementsByClassName(
                'total-number-users-popup'
              )[0].innerHTML = '(' + e.data.totalUser + ')');
            document.getElementsByClassName('dApp-app-image-popup')[0].src =
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
              'dApp-heading-title-popup'
            )[0].textContent = e.data.name;
            document.getElementsByClassName('dApp-content-popup')[0].innerHTML =
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
              'dApp-heading-title-popup'
            )[0].textContent = getSIngleArray.name;
            document.getElementsByClassName(
              'dApp-content-popup'
            )[0].textContent = getSIngleArray.description;
          }
        }),
        a.send(),
        $(document).on('click', '#' + e, function (e) {
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
          $('.dApp-popup-onrequest-form').css('display', 'flex'),
            (document
              .querySelector('.dApp-popup-onrequest-form')
              .animate(
                { opacity: [0, 1] },
                { duration: 600, iterations: 1, easing: 'ease-in' }
              ).onfinish = (e) => {
              e.target.effect.target.style.opacity = 1;
            });
        });
    }

    function getSingleNews() {
      let newsUrl = new URL('http://192.168.1.131:3000/marketplace/DApps');
      let request = new XMLHttpRequest();
      let url = newsUrl;
      request.open('GET', url, true);
      request.onload = function () {
        let data = JSON.parse(this.response);
        console.log('data', data);
        if (request.status >= 200 && request.status < 400) {
          data.data.data.forEach((singleDApp) => {
            console.log('singleDApp', singleDApp);
            let publicPrivateIcon = '';
            if (singleDApp.blckChnAvailability == 0) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-lock" data-toggle="tooltip" title="Private BlockChain"></i>';
            } else if (singleDApp.blckChnAvailability == 1) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-group" data-toggle="tooltip" title="Public BlockChain"></i>';
            } else if (singleDApp.blckChnAvailability == 2) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-lock" data-toggle="tooltip" title="Private BlockChain"></i> / <i class="fa-solid fa-user-group" data-toggle="tooltip" title="Public BlockChain"></i>';
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
              `" wirth="35px" height="35px" class="DApp-image">` +
              singleDApp.name +
              `</td><td>` +
              singleDApp.categoryName +
              `</td><td>` +
              publicPrivateIcon +
              `</td><td>-</td><td class="singleAppName">` +
              gRSY(singleDApp.rating) +
              `</td><td><span class="` +
              statusDetail +
              `">●</span></td></tr>`;
            console.log('DAppBody', DAppBody);
            $('.DAppsBody').append($(DAppBody));
            $('#DAppsListItem').append(
              '<option value="' +
                singleDApp.id +
                '">' +
                singleDApp.name +
                '</option>'
            );
            $(document).ready(function () {
              $('.app_' + singleDApp.id).on('mouseenter', function () {
                console.log(singleDApp.id);
                gSDap(singleDApp.id);
              });
            });
          });
          data.data.requestedData.forEach((singleDApp) => {
            let publicPrivateIcon = '';
            if (singleDApp.blckChnAvailability == 0) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-lock" data-toggle="tooltip" title="Private BlockChain"></i>';
            } else if (singleDApp.blckChnAvailability == 1) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-group" data-toggle="tooltip" title="Public BlockChain"></i>';
            } else if (singleDApp.blckChnAvailability == 2) {
              publicPrivateIcon =
                '<i class="fa-solid fa-user-lock" data-toggle="tooltip" title="Private BlockChain"></i> / <i class="fa-solid fa-user-group" data-toggle="tooltip" title="Public BlockChain"></i>';
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
              `" wirth="35px" height="35px" class="DApp-image">` +
              singleDApp.name +
              `</td><td>` +
              singleDApp.categoryName +
              `</td><td>` +
              publicPrivateIcon +
              `</td><td><img src="images/arrow-right-up.svg" loading="lazy" id="w-node-fa2767f4-10ae-2b60-fae8-e7da0e711c43-9c8160e9" alt="" class="image-39"></td><td class="singleAppName">` +
              gRSY(singleDApp.rating) +
              `</td><td><span class="` +
              statusDetail +
              `">●</span></td></tr>`;
            $('.DAppsBody').append($(DAppBody));
            $('#DAppsListItem').append(
              '<option value="' +
                singleDApp.id +
                '">' +
                singleDApp.name +
                '</option>'
            );
            $(document).ready(function () {
              $('.app_' + singleDApp.id).on('mouseenter', function () {
                console.log(singleDApp.id);
                gSDap(singleDApp.id);
              });
            });
          });
        }
      };

      request.send();
    }
    getSingleNews();
  });
});
