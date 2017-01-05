$(document).ready(function () {
  $(".remove-btn").click(function (e) {
    e.target.closest(".option").remove();
  });

  $(".add-btn").click(function (e) {
    var lastInputBoxId = $(".option").last().find("input").attr("id");
    var newOptionIndex = +lastInputBoxId.replace("option", "") + 1;
    var newOption = $(".option").first().clone(true);
    newOption.find("input")
      .attr("name", "option" + newOptionIndex)
      .attr("id", "option" + newOptionIndex)
      .val("");
    newOption.find(".add-btn").remove();
    newOption.find(".remove-btn").removeClass("hidden");
    $(".option-list").append(newOption);
  });
});
