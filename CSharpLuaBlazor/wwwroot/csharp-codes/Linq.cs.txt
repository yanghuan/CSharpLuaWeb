using System;
using System.Linq;

namespace Linq {
  public static class Program {
    public static void Main() {
      string[] names = new string[] { "Yang", "Zhang", "Li", "Wang", "Mao" };

      var query =
          from n in names
          where n.Contains("a")
          orderby n
          select n;

      string result = query.Aggregate((x, y) => x + ':' + y);
      Console.WriteLine(result);
    }
  }
}
