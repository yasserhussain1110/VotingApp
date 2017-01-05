$(document).ready(function () {
  onPollReady(answers);
});

function random(lower_limit, upper_limit) {
  return ((Math.random() * (upper_limit - lower_limit + 1)) | 0) + lower_limit;
}

function onPollReady(answers) {
  var ansItems = answers.map(function (ans) {
    return ans.value;
  });

  var ansVote = answers.map(function (ans) {
    return ans.vote;
  });

  buildOptions(ansItems);
  buildDoughnut(ansItems, generateRandomColors(answers.length), ansVote)
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
      + ", 0.2)";
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
      }
    }
  });
}
