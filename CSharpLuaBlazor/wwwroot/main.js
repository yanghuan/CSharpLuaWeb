$(function () {
  var samples = [
    "Hello World",
    "Fibonacci",
    "TimeoutQueue",
    "Linq"
  ];

  $.each(samples, function (k, v) {
    var path = "./csharp-codes/" + v.replace(" ", "-") + ".cs.txt"
    $.get(path, function (data) {
      var option = $("<option>").text("Sample: " + v).val(data);
      $("#examples").append(option);
    }, "text");
  });

  require.config({
    paths: {
      'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'
    }
  });
  require(['vs/editor/editor.main'], start);

  function start() {
    jQuery.support.cors = true;
    var sampleSelect = $("#examples");
    var loading = $("#loading");
    var autoRunTimer = null;

    var csharpEditor = monaco.editor.create(document.getElementById('CSharpEditor'), {
      value: "",
      language: 'csharp'
    });
    csharpEditor.onKeyUp(function () {
      if (autoRunTimer) {
        clearTimeout(autoRunTimer);
        autoRunTimer = null;
      }
      autoRunTimer = setTimeout(run, 2000);
    });

    var luaEditor = monaco.editor.create(document.getElementById('LuaEditor'), {
      value: "",
      language: 'lua'
    });

    function switchElement() {
      loading.toggle();
    };

    function run(loading) {
      if (loading) {
        switchElement();
      }
      DotNet.invokeMethodAsync('CSharpLuaBlazor', 'Compile', csharpEditor.getValue()).then(data => {
        luaEditor.setValue(data);
        switchElement();
      });
    };

    function setCurSelect(loading) {
      csharpEditor.setValue(sampleSelect.val());
      run(loading);
    };

    sampleSelect.change(function () {
      setCurSelect(true);
    });

    switchElement();
    window.start = () => setCurSelect(false);
  };
});
