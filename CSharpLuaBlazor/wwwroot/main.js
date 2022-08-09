$(function () {
  let max = 100
  let count = 0
  $.getJSON("https://api.github.com/repos/yanghuan/CSharpLuaWeb/contents/CSharpLuaBlazor/wwwroot/csharp-codes", function (data) {
    max = data.length
    $.each(data, function (k, v) {
      let name = v.name.split('.')[0].replace("-", " ")
      $.get(v.download_url, function (data) {
        var option = $("<option>").text("Sample: " + name).val(data);
        $("#examples").append(option);
        check();
      }, "text");
    });
  });

  require.config({
    paths: {
      'vs': 'https://cdn.jsdelivr.net/npm/monaco-editor@0.33.0/min/vs'
    }
  });
  require(['vs/editor/editor.main'], check());

  function check() {
    ++count;
    if (count == max + 1) {
      start()
    }
  }

  function start () {
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
