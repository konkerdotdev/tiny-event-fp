import * as P from '@konker.dev/effect-ts-prelude';

import * as unit from './tiny-event';

describe('TinyEvent', () => {
  const EventTypeFoo = 'Foo';
  const EventTypeBar = 'Bar';
  const EventTypeBaz = 'Baz';
  type EventType = typeof EventTypeFoo | typeof EventTypeBar | typeof EventTypeBaz;

  it('should work as expected', async () => {
    const l1 = jest.fn((_t: EventType, _d?: string) => P.Effect.unit);
    const l2 = jest.fn((_t: EventType, _d?: string) => P.Effect.unit);
    const l3 = jest.fn((_t: EventType, _d?: string) => P.Effect.unit);

    const prog = P.pipe(
      unit.createTinyEventDispatcher<EventType, string>(),
      (x) => x,
      P.Effect.flatMap(unit.addListener<EventType, string>(EventTypeFoo, l1)),
      P.Effect.flatMap(unit.addListener<EventType, string>(EventTypeBar, l2)),
      P.Effect.flatMap(unit.addStarListener<EventType, string>(l3)),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeFoo, 'Hello Foo 1')),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeBar, 'Hello Bar 1')),
      P.Effect.flatMap(unit.removeListener<EventType, string>(EventTypeFoo, l1)),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeFoo, 'Hello Foo 2')),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeBar, 'Hello Bar 2')),
      P.Effect.flatMap(unit.removeStarListener<EventType, string>(l3)),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeFoo, 'Hello Foo 3')),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeBar, 'Hello Bar 3')),
      P.Effect.flatMap(unit.removeAllListeners<EventType, string>()),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeFoo, 'Hello Foo 4')),
      P.Effect.flatMap(unit.notify<EventType, string>(EventTypeBar, 'Hello Bar 4'))
    );

    const result = await P.Effect.runPromise(prog);
    await expect(result).toHaveProperty('listeners');
    expect(l1).toHaveBeenCalledTimes(1);
    expect(l1.mock.calls[0]).toEqual([EventTypeFoo, 'Hello Foo 1']);
    expect(l2).toHaveBeenCalledTimes(3);
    expect(l2.mock.calls[0]).toEqual([EventTypeBar, 'Hello Bar 1']);
    expect(l2.mock.calls[1]).toEqual([EventTypeBar, 'Hello Bar 2']);
    expect(l2.mock.calls[2]).toEqual([EventTypeBar, 'Hello Bar 3']);
    expect(l3).toHaveBeenCalledTimes(4);
    expect(l3.mock.calls[0]).toEqual([EventTypeFoo, 'Hello Foo 1']);
    expect(l3.mock.calls[1]).toEqual([EventTypeBar, 'Hello Bar 1']);
    expect(l3.mock.calls[2]).toEqual([EventTypeFoo, 'Hello Foo 2']);
    expect(l3.mock.calls[3]).toEqual([EventTypeBar, 'Hello Bar 2']);
  });
});
