function RegisterCalculator(form, error, loading, functionName, getArguments, displayResults) {
  form.submit(function(event) {
    event.preventDefault()

    //loading.show()
    error.hide()

    var args = getArguments()

    console.log(args);

    var url = "https://restorethesoulfunctionsratecalculator20200301085153.azurewebsites.net/api/" + functionName + "/?"

    url += $.param(args)

    $.get(url, function(rawData) {
        console.log("Data:")
        console.log(rawData)
        displayResults(JSON.parse(rawData))
      })
      .fail(function(errorData) {
        error.text("Error: " + errorData.responseText)
        error.show()
        console.log(errorData)
      })
      .always(function() {
        loading.hide()
      })
  })
}

function GetMarkerElement(marker, selector = null) {
  var previous = marker.parent().parent().prev()

  if (selector !== null) {
    return previous.find(selector)
  } else {
    if (previous.children().length > 0) {
      var firstChild = previous.children().first()

      if (firstChild.children().length > 0) {
        return firstChild.children().first()
      }

      return firstChild
    } else {
      return previous
    }
  }
}

function SetDisplayValue(element, value, shouldReplace = false) {
  var text = element.text()

  if (shouldReplace) {
    element.text(value)
  } else {
    element.text(text.split(':')[0] + ': ' + value)

  }
  
  element.show()
}

function InitializeCalculators() {
  $(".calc.form").each(function() {
    var formMarker = $(this)
    var form = formMarker.closest("form")
    
    form.off("submit");

    var id = formMarker.attr("name")

    var errorMarker = $(".calc.error." + id)
    var error = GetMarkerElement(errorMarker)

    error.hide()

    var loadingMarker = $(".calc.loading-message." + id)
    var loading = GetMarkerElement(loadingMarker)

    loading.hide()

    var getArguments = null
    var displayResults = null

    var functionName = "GetFeesFunction"

    var submit = form.find(".wsite-button").children().first()

    var name = formMarker.val()

    if (name.length) {
      submit.text(name)
    }

    if (formMarker.hasClass("copay")) {
      console.log("[CALCULATOR] Registering form as copay form.")

      var coverageMarker = $(".calc.coverage." + id)
      var coverage = GetMarkerElement(coverageMarker, "input")

      coverage.prop('type', 'number')
      coverage.prop('min', '0')
      coverage.prop('max', '100')

      getArguments = function() {
        return {
          "coverage": coverage.val() / 100
        }
      }
      
      var copayMarker = $(".calc.copay." + id)
      var copay = GetMarkerElement(copayMarker)
      
      copay.hide()

      displayResults = function(data) {
        SetDisplayValue(copay, data.SessionFee, copayMarker.hasClass('replace'))
      }

      functionName = "GetCopayFunction"

    } else if (formMarker.hasClass("income")) {
      console.log("[CALCULATOR] Registering form as income form.")

      var coverageMarker = $(".calc.coverage." + id)
      var coverage = GetMarkerElement(coverageMarker, "input")

      coverage.prop('type', 'number')
      coverage.prop('min', '0')
      coverage.prop('max', '100')

      var incomeMarker = $(".calc.income." + id)

      var householdMemberMarker = $(".calc.household." + id)

      getArguments = function() {
        var income = GetMarkerElement(incomeMarker, "input[type='radio']:checked")

        var householdMembers = GetMarkerElement(householdMemberMarker, "input[type='radio']:checked")

        var finalIncome = income.val().split('$')[1].replace(',', '')        
               
        if (~income.val().toLowerCase().indexOf("less than")){
          finalIncome = 5000
        }
        else if (~income.val().toLowerCase().indexOf("more than")){
          finalIncome = 101000
        }
        
        return {
          "coverage": coverage.val() / 100,
          "income": finalIncome,
          "householdMembers": householdMembers.val(),
        }
      }
      
      var sessionFeeMarker = $(".calc.session-fee." + id)
      var sessionFee = GetMarkerElement(sessionFeeMarker)
      
      sessionFee.hide()
      
      var monthlyRateMarker = $(".calc.monthly-rate." + id)
      var monthlyRate = GetMarkerElement(monthlyRateMarker)
      
      monthlyRate.hide()
      
      var monthsPayoffMarker = $(".calc.months-payoff." + id)
      var monthsPayoffRate = GetMarkerElement(monthsPayoffMarker)
      
      monthsPayoffRate.hide()

      displayResults = function(data) {
        SetDisplayValue(sessionFee, data.SessionFee, sessionFeeMarker.hasClass('replace'))        

        SetDisplayValue(monthlyRate, data.MonthlyFee, monthlyRateMarker.hasClass('replace'))        

        SetDisplayValue(monthsPayoffRate, data.MonthsToPayOff, monthsPayoffMarker.hasClass('replace'))

      }

    } else {
      console.log("[CALCULATOR] TODO Form is unlabelled form. This should not be happening!!!")
      // TODO
    }

    if (getArguments !== null && displayResults !== null) {
      RegisterCalculator(form, error, loading, functionName, getArguments, displayResults)
    }
  })
}

InitializeCalculators()
