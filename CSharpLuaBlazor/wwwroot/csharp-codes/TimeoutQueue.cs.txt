using System;
using System.Collections.Generic;
using System.Linq;

namespace Ice.Utils {
  public sealed class TimeoutQueue {
    private sealed class Event {
      public int Id;
      public Int64 Expiration;
      public Int64 RepeatInterval;
      public Action<int, Int64> Callback;
      public LinkedListNode<Event> LinkNode;
    }

    private int nextId_ = 1;
    private Dictionary<int, Event> ids_ = new Dictionary<int, Event>();
    private LinkedList<Event> events_ = new LinkedList<Event>();

    private int NextId {
      get { return nextId_++; }
    }

    private void Insert(Event e) {
      ids_.Add(e.Id, e);
      Event next = events_.FirstOrDefault(i => i.Expiration > e.Expiration);
      if (next != null) {
        e.LinkNode = events_.AddBefore(next.LinkNode, e);
      } else {
        e.LinkNode = events_.AddLast(e);
      }
    }

    public int Add(Int64 now, Int64 delay, Action<int, Int64> callback) {
      return AddRepeating(now, delay, 0, callback);
    }

    public int AddRepeating(Int64 now, Int64 interval, Action<int, Int64> callback) {
      return AddRepeating(now, interval, interval, callback);
    }

    public int AddRepeating(Int64 now, Int64 delay, Int64 interval, Action<int, Int64> callback) {
      int id = NextId;
      Insert(new Event() {
        Id = id,
        Expiration = now + delay,
        RepeatInterval = interval,
        Callback = callback
      });
      return id;
    }

    public Int64 NextExpiration {
      get {
        return events_.Count > 0 ? events_.First.Value.Expiration : Int64.MaxValue;
      }
    }

    public bool Erase(int id) {
      Event e;
      if (ids_.TryGetValue(id, out e)) {
        ids_.Remove(id);
        events_.Remove(e.LinkNode);
        return true;
      }
      return false;
    }

    public Int64 RunOnce(Int64 now) {
      return RunInternal(now, true);
    }

    public Int64 RunLoop(Int64 now) {
      return RunInternal(now, false);
    }

    public bool IsEmpty {
      get {
        return ids_.Count == 0;
      }
    }

    public bool Contains(int id) {
      return ids_.ContainsKey(id);
    }

    private Int64 RunInternal(Int64 now, bool onceOnly) {
      Int64 nextExp;
      do {
        List<Event> expired = events_.TakeWhile(i => i.Expiration <= now).ToList();
        foreach (Event e in expired) {
          Erase(e.Id);
          if (e.RepeatInterval > 0) {
            e.Expiration += e.RepeatInterval;
            Insert(e);
          }
        }
        foreach (Event e in expired) {
          e.Callback(e.Id, now);
        }
        nextExp = NextExpiration;
      } while (!onceOnly && nextExp <= now);
      return nextExp;
    }
  }
}