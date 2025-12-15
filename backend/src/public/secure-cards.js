(function() {
  var accessInfo = document.getElementById('accessInfo');
  var formSection = document.getElementById('form-section');
  var previewSection = document.getElementById('preview-section');
  var resultSection = document.getElementById('result-section');
  var cardForm = document.getElementById('card-form');
  var createCardBtn = document.getElementById('createCardBtn');
  var backToDashboardBtn = document.getElementById('backToDashboardBtn');
  var createStatus = document.getElementById('createStatus');
  var scanUrlText = document.getElementById('scanUrlText');
  var qrBox = document.getElementById('qrBox');

  var firstNameInput = document.getElementById('firstName');
  var lastNameInput = document.getElementById('lastName');
  var mobileInput = document.getElementById('mobile');
  var officeInput = document.getElementById('office');
  var companyInput = document.getElementById('company');
  var positionInput = document.getElementById('position');
  var emailInput = document.getElementById('email');
  var addressStreetInput = document.getElementById('addressStreet');
  var addressCityInput = document.getElementById('addressCity');
  var addressRegionInput = document.getElementById('addressRegion');
  var addressZipCountryInput = document.getElementById('addressZipCountry');

  var designNameEl = document.getElementById('designName');
  var designCompanyEl = document.getElementById('designCompany');
  var designPositionEl = document.getElementById('designPosition');
  var designPhonesEl = document.getElementById('designPhones');
  var designEmailEl = document.getElementById('designEmail');
  var designAddressEl = document.getElementById('designAddress');

  var authToken = '';
  var currentUser = null;

  var AUTOSAVE_KEY = 'nc_secure_card_draft';

  function setStatus(message, type) {
    if (!createStatus) return;
    createStatus.textContent = message || '';
    createStatus.className = 'status' + (type ? ' ' + type : '');
  }

  function renderQr(text) {
    if (!qrBox) return;
    qrBox.innerHTML = '';
    if (!text) return;
    try {
      new QRCode(qrBox, {
        text: text,
        width: 256,
        height: 256,
        correctLevel: QRCode.CorrectLevel.L
      });
    } catch (e) {
      qrBox.textContent = 'Unable to generate QR code.';
    }
  }

  function saveDraft() {
    try {
      var data = {
        firstName: (firstNameInput && firstNameInput.value) || '',
        lastName: (lastNameInput && lastNameInput.value) || '',
        mobile: (mobileInput && mobileInput.value) || '',
        office: (officeInput && officeInput.value) || '',
        company: (companyInput && companyInput.value) || '',
        position: (positionInput && positionInput.value) || '',
        email: (emailInput && emailInput.value) || '',
        street: (addressStreetInput && addressStreetInput.value) || '',
        city: (addressCityInput && addressCityInput.value) || '',
        region: (addressRegionInput && addressRegionInput.value) || '',
        zipCountry: (addressZipCountryInput && addressZipCountryInput.value) || ''
      };
      window.localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // ignore autosave errors
    }
  }

  function restoreDraft() {
    try {
      var raw = window.localStorage.getItem(AUTOSAVE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (!data || typeof data !== 'object') return;

      if (firstNameInput) firstNameInput.value = data.firstName || '';
      if (lastNameInput) lastNameInput.value = data.lastName || '';
      if (mobileInput) mobileInput.value = data.mobile || '';
      if (officeInput) officeInput.value = data.office || '';
      if (companyInput) companyInput.value = data.company || '';
      if (positionInput) positionInput.value = data.position || '';
      if (emailInput) emailInput.value = data.email || '';
      if (addressStreetInput) addressStreetInput.value = data.street || '';
      if (addressCityInput) addressCityInput.value = data.city || '';
      if (addressRegionInput) addressRegionInput.value = data.region || '';
      if (addressZipCountryInput) addressZipCountryInput.value = data.zipCountry || '';
    } catch (e) {
      // ignore restore errors
    }
  }

  function updatePreview() {
    if (!designNameEl || !designCompanyEl || !designPositionEl || !designPhonesEl || !designEmailEl || !designAddressEl) {
      return;
    }

    var firstName = (firstNameInput && firstNameInput.value || '').trim();
    var lastName = (lastNameInput && lastNameInput.value || '').trim();
    var company = (companyInput && companyInput.value || '').trim();
    var position = (positionInput && positionInput.value || '').trim();
    var mobile = (mobileInput && mobileInput.value || '').trim();
    var office = (officeInput && officeInput.value || '').trim();
    var email = (emailInput && emailInput.value || '').trim();
    var street = (addressStreetInput && addressStreetInput.value || '').trim();
    var city = (addressCityInput && addressCityInput.value || '').trim();
    var region = (addressRegionInput && addressRegionInput.value || '').trim();
    var zipCountry = (addressZipCountryInput && addressZipCountryInput.value || '').trim();

    var nameDisplay = (firstName || lastName) ? (firstName + (firstName && lastName ? ' ' : '') + lastName) : 'Your Name';
    var companyDisplay = company || 'Company';
    var positionDisplay = position || 'Post / Position';

    var phones = [];
    if (mobile) phones.push(mobile);
    if (office) phones.push(office);
    var phonesDisplay = phones.length ? phones.join(' / ') : '+00 0000000000';

    var emailDisplay = email || 'name@example.com';

    var addressParts = [];
    if (street) addressParts.push(street);
    var cityLine = '';
    if (city) cityLine += city;
    if (zipCountry) {
      cityLine += (cityLine ? ' ' : '') + zipCountry;
    }
    if (region) {
      cityLine += (cityLine ? ', ' : '') + region;
    }
    if (cityLine) addressParts.push(cityLine);
    var addressDisplay = addressParts.length ? addressParts.join(', ') : 'Address will appear here';

    designNameEl.textContent = nameDisplay;
    designCompanyEl.textContent = companyDisplay;
    designPositionEl.textContent = positionDisplay;
    designPhonesEl.textContent = phonesDisplay;
    designEmailEl.textContent = emailDisplay;
    designAddressEl.textContent = addressDisplay;
  }

  function loadAuth() {
    try {
      authToken = window.localStorage.getItem('nc_auth_token') || '';
      var userJson = window.localStorage.getItem('nc_auth_user');
      if (authToken && userJson) {
        currentUser = JSON.parse(userJson);
      }
    } catch (e) {
      authToken = '';
      currentUser = null;
    }
  }

  function initAccess() {
    loadAuth();
    if (!authToken || !currentUser) {
      if (accessInfo) {
        accessInfo.textContent = 'You are not signed in. Use the secure dashboard login first, then return here. You will be redirected now.';
      }
      if (formSection) formSection.style.display = 'none';
      if (previewSection) previewSection.style.display = 'none';
      if (resultSection) resultSection.style.display = 'none';
      setTimeout(function() {
        window.location.href = '/secure-dashboard';
      }, 1500);
      return;
    }

    var role = currentUser.role;
    if (role === 'cdc_admin' || role === 'tenant_admin' || role === 'manager') {
      var companyName = currentUser.tenantName || '';
      if (accessInfo) {
        if (companyName) {
          accessInfo.textContent = 'Signed in as ' + (currentUser.displayName || currentUser.email || 'user') + ' (' + role + ') for ' + companyName + '.';
        } else {
          accessInfo.textContent = 'Signed in as ' + (currentUser.displayName || currentUser.email || 'user') + ' (' + role + ').';
        }
      }
      if (formSection) formSection.style.display = 'block';
      if (previewSection) previewSection.style.display = 'block';
      restoreDraft();
      updatePreview();
    } else {
      if (accessInfo) {
        accessInfo.textContent = 'Your role (' + role + ') does not allow creating NameCards. Please contact your administrator.';
      }
      if (formSection) formSection.style.display = 'none';
      if (previewSection) previewSection.style.display = 'none';
      if (resultSection) resultSection.style.display = 'none';
    }
  }

  if (backToDashboardBtn) {
    backToDashboardBtn.addEventListener('click', function() {
      window.location.href = '/secure-dashboard';
    });
  }

  if (cardForm) {
    cardForm.addEventListener('submit', function(evt) {
      evt.preventDefault();

      if (!authToken) {
        setStatus('Missing auth token. Please sign in via the secure dashboard first.', 'error');
        return;
      }

      var firstName = (firstNameInput.value || '').trim();
      var lastName = (lastNameInput.value || '').trim();
      var mobile = (mobileInput.value || '').trim();

      if (!firstName || !lastName || !mobile) {
        setStatus('Please fill at least first name, last name and mobile.', 'error');
        return;
      }

      var office = (officeInput.value || '').trim();
      var company = (companyInput.value || '').trim();
      var position = (positionInput.value || '').trim();
      var email = (emailInput.value || '').trim();
      var street = (addressStreetInput.value || '').trim();
      var city = (addressCityInput.value || '').trim();
      var region = (addressRegionInput.value || '').trim();
      var zipCountry = (addressZipCountryInput.value || '').trim();

      var address = [street, city, region, zipCountry].filter(function(s) { return s; }).join('\n');

      createCardBtn.disabled = true;
      setStatus('Creating card…', '');

      fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
          mobile: mobile,
          office: office,
          company: company,
          position: position,
          email: email,
          address: address,
          street: street,
          city: city,
          region: region,
          zipCountry: zipCountry
        })
      })
        .then(function(resp) { return resp.json(); })
        .then(function(data) {
          createCardBtn.disabled = false;
          if (!data || !data.success || !data.card || !data.card.scanUrl) {
            setStatus((data && data.message) || 'Failed to create card.', 'error');
            return;
          }

          var scanUrl = data.card.scanUrl;
          scanUrlText.textContent = scanUrl;
          renderQr(scanUrl);
          if (resultSection) resultSection.style.display = 'block';
          setStatus('Card created.', 'ok');
        })
        .catch(function(err) {
          console.error('Error creating card via secure builder:', err);
          createCardBtn.disabled = false;
          setStatus('Error while creating card.', 'error');
        });
    });
  }

  var previewInputs = [
    firstNameInput,
    lastNameInput,
    emailInput,
    addressStreetInput,
    addressCityInput,
    addressRegionInput,
    addressZipCountryInput,
    mobileInput,
    officeInput,
    companyInput,
    positionInput
  ];

  previewInputs.forEach(function(el) {
    if (!el) return;
    el.addEventListener('input', function() {
      updatePreview();
      saveDraft();
    });
  });

  initAccess();
})();
