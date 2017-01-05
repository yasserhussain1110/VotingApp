$(document).ready(function () {
  $(".remove-btn").click(function (e) {
    e.target.closest(".choice").remove();
  });

  $(".add-btn").click(function (e) {
    var lastInputBoxId = $(".choice").last().find("input").attr("id");
    var newchoiceIndex = +lastInputBoxId.replace("choice", "") + 1;
    var newchoice = $(".choice").first().clone(true);
    newchoice.find("input")
      .attr("name", "choice" + newchoiceIndex)
      .attr("id", "choice" + newchoiceIndex)
      .val("");
    newchoice.find(".add-btn").remove();
    newchoice.find(".remove-btn").removeClass("hidden");
    $(".choice-list").append(newchoice);
  });
});
