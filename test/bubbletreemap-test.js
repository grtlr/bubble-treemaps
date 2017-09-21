var tape = require("tape"),
    bubbletreemap = require("../");

tape("foo() returns the answer to the ultimate question of life, the universe, and everything.", function(test) {
  test.equal(bubbletreemap.bubbletreemap().curvature(), 10);
  test.end();
});
