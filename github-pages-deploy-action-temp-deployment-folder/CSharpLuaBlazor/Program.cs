using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using System.Reflection;

using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace CSharpLuaBlazor
{
  public static class Compiler {
    private static readonly List<byte[]> libs_ = new();
    private static readonly List<byte[]> metas_ = new();

    private static IEnumerable<Stream> ToStreams(List<byte[]> datas) => datas.Select(i => new MemoryStream(i));

    private static string CompileInternal(string code) {
      string result;
      try {
        string luaCode = CSharpLua.Compiler.CompileSingleCode(code, ToStreams(libs_), ToStreams(metas_));
        result = luaCode;
      } catch (CSharpLua.CompilationErrorException e) {
        result = e.Message;
        Console.Error.WriteLine(e.ToString());
      } catch (Exception e) {
        result = e.ToString();
         Console.Error.WriteLine(e.ToString());
      }
      return result;
    }

    public static Task<string> Compile(string code) {
      return Task.Factory.StartNew(() => CompileInternal(code));
    }

    private static async Task LoadData(HttpClient client) {
      var dataBytes = await client.GetByteArrayAsync("data.zip");
      using var dataZip = new ZipArchive(new MemoryStream(dataBytes), ZipArchiveMode.Read); 
      foreach(var entry in dataZip.Entries) {
        var entryMemoryStream = new MemoryStream();
        using(var entrySourceStream = entry.Open()) {
             entrySourceStream.CopyTo(entryMemoryStream);
        }
        var entryBytes = entryMemoryStream.ToArray();
        if (entry.Name.EndsWith(".dll")) {
           libs_.Add(entryBytes);
        } else {
          metas_.Add(entryBytes);
        }
      }
    }

    public static async Task Init(HttpClient client) {
      await LoadData(client);
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
