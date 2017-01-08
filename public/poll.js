$(document).ready(function () {
  onPollReady(answers);

  $(".twitter-btn").click(function (e) {
    window.open(this.href, '', 'menubar=no, toolbar=no,resizable=yes,scrollbars=yes,height=400,width=400');
    return false;
  });

  $(".new-choice-button").click(function (e) {
    var btn = $(".new-choice-button");
    if (btn.hasClass("pressed")) {
      btn.removeClass("pressed");
      $(".new-choice").addClass("hidden");
    } else {
      btn.addClass("pressed");
      $(".new-choice").removeClass("hidden");
    }
  });
});

function random(lower_limit, upper_limit) {
  return ((Math.random() * (upper_limit - lower_limit + 1)) | 0) + lower_limit;
}

function onPollReady(answers) {
  var ansChoices = answers.map(function (ans) {
    return ans.choice;
  });

  var ansVotes = answers.map(function (ans) {
    return ans.votes;
  });

  buildOptions(ansChoices);
  buildDoughnut(ansChoices, generateRandomColors(answers.length), ansVotes)
}

function buildOptions(options) {
  $("#user-choice").append(
    options.map(function (optionVal) {
      return $("<option/>").val(optionVal).html(optionVal);
    }));
}

function padThree(num) {
  num = "" + num;
  return '0'.repeat(3 - num.length) + num;
}

function generateRandomColorNumbers(length) {
  var randomColors = [];
  for (var i = 0; i < length; i++) {

    var a = padThree(random(0, 255));
    var b = padThree(random(0, 255));
    var c = padThree(random(0, 255));
    var randomColor = a + b + c;

    while (randomColors.indexOf(randomColor) !== -1) {
      a = padThree(random(0, 255));
      b = padThree(random(0, 255));
      c = padThree(random(0, 255));
      randomColor = a + b + c;
    }
    randomColors.push(randomColor);
  }
  return randomColors;
}

function generateRandomColors(length) {
  var colorNumbers = generateRandomColorNumbers(length);
  return colorNumbers.map(function (color) {
    return 'rgba(' + color[0] + color[1] + color[2]
      + ", " + color[3] + color[4] + color[5]
      + ", " + color[6] + color[7] + color[8]
      + ", 1)";
  });
}

function buildDoughnut(labels, colors, data) {
  var ctx = document.getElementById("voteChart").getContext("2d");
  var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        label: '# of Votes',
        data: data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      cutoutPercentage: 30,
      fullWidth: false,
      legend: {
        display: true,
        position: 'bottom'
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            var allData = data.datasets[tooltipItem.datasetIndex].data;
            var tooltipLabel = data.labels[tooltipItem.index];
            var tooltipData = allData[tooltipItem.index];
            var total = 0;
            for (var i in allData) {
              total += allData[i];
            }
            var tooltipPercentage = Math.round((tooltipData / total) * 100);
            return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
          }
        }
      }
    }
  });
}
