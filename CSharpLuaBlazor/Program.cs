using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CSharpLuaBlazor
{
  public static class Compiler {
    class BlazorBoot {
      public bool cacheBootResources { get; set; }
      public object[] config { get; set; }
      public bool debugBuild { get; set; }
      public string entryAssembly { get; set; }
      public bool linkerEnabled { get; set; }
      public Resources resources { get; set; }
    }

    class Resources {
      public Dictionary<string, string> assembly { get; set; }
      public Dictionary<string, string> pdb { get; set; }
      public Dictionary<string, string> runtime { get; set; }
    }

    private static readonly List<byte[]> libs_ = new List<byte[]>();
    private static readonly List<byte[]> metas_ = new List<byte[]>();

    private static IEnumerable<Stream> ToStreams(List<byte[]> datas) => datas.Select(i => new MemoryStream(i));

    private static string CompileInternal(string code) {
      string result;
      try {
        string luaCode = CSharpLua.Compiler.CompileSingleCode(code, ToStreams(libs_), ToStreams(metas_));
        result = luaCode;
      } catch (CSharpLua.CompilationErrorException e) {
        result = e.Message;
      } catch (Exception e) {
        result = e.ToString();
      }
      return result;
    }

    public static Task<string> Compile(string code) {
      return Task.Factory.StartNew(() => CompileInternal(code));
    }

    private static async Task LoadReferences(HttpClient client) {
      var response = await client.GetFromJsonAsync<BlazorBoot>("_framework/blazor.boot.json");
      var bytes = await Task.WhenAll(response.resources.assembly.Keys.Select(x => client.GetByteArrayAsync("_framework/" + x)));
      libs_.AddRange(bytes);
    }

    private static async Task LoadMetas(HttpClient client) {
      var bytes = await client.GetByteArrayAsync("System.xml");
      metas_.Add(bytes);
    }

    public static async Task Init(HttpClient client) {
      await LoadReferences(client);
      await LoadMetas(client);
    }
  }

  public class Program
  {
    public static async Task Main(string[] args)
    {
      var builder = WebAssemblyHostBuilder.CreateDefault(args);
      builder.RootComponents.Add<App>("app");
      builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });
      await builder.Build().RunAsync();
    }
  }
}
