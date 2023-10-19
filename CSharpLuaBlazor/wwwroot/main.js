$(function () {
  let baseUrl = "https://raw.githubusercontent.com/yanghuan/CSharpLuaWeb/main/CSharpLuaBlazor/wwwroot/"
  let max = 100
  let count = 0
  $.get(baseUrl + "codefiles.txt", function (data){
    let fileNames = data.split("\r\n").filter(i => i.length > 0);
    max = fileNames.length;
    $.each(fileNames, function (k, v) {
      let downloadUrl = baseUrl + "csharp-codes/" + v
      $.get(downloadUrl, function (data) {
        let name = v.split('.')[0].replace("-", " ")
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
  require(['vs/editor/editor.main'], check);

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
