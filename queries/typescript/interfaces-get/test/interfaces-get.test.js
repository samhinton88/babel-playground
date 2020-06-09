const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const { readFile } = require("../../../../test-helpers");
const interfacesGet = require("..");

const runTraverse = (str, visitor, state) => {
  const ast = parser.parse(str, {
    allowImportExportEverywhere: true,
    plugins: ["jsx", "classProperties", "typescript"],
  });

  traverse(ast, visitor(state));

  return state;
};

const tsVal = (value) => ({ value: `TS${value}Keyword` });
const tsType = (value) => ({ value: `TS${value}Type` });

const stringWithKey = (key) => ({ key, ...tsVal("String") });
const numberWithKey = (key) => ({ key, ...tsVal("Number") });
const anyWithKey = (key) => ({ key, ...tsVal("Any") });
const funcWithKey = (key) => ({ key, ...tsType("Function") });
const tupleWithKey = (key, ...types) => ({
  key,
  ...tsType("Tuple"),
  value: types,
});

describe("interfacesGet", () => {
  describe("when given a code sample with an empty interface", () => {
    let code;
    let state = [];
    let result;

    beforeEach(async () => {
      code = await readFile(`${__dirname}/samples/empty-interface.ts`);
      result = runTraverse(code, interfacesGet, state);
    });

    it("should identify that interface", () => {
      expect(state[0].name).toBe("IFoo");
    });

    it("should return the node itself", () => {
      expect(state[0].props).toEqual([]);
    });

    it("should return the location of the node", () => {
      expect(state[0].loc).toEqual({
        end: { column: 17, line: 1 },
        start: { column: 0, line: 1 },
      });
    });
  });

  describe("when given a code sample with an interface containing a property", () => {
    let code;
    let state = [];
    let result;

    beforeEach(async () => {
      code = await readFile(`${__dirname}/samples/interface-with-property.ts`);
      result = runTraverse(code, interfacesGet, state);
    });

    it("should identify that interface", () => {
      expect(state[0].name).toBe("IFoo");
    });

    it("should return the properties as an array", () => {
      expect(state[0].props).toEqual([
        { key: "name", value: "TSStringKeyword" },
      ]);
    });
  });

  describe("when given a code sample with an interface containing a  mixture of properties", () => {
    let code;
    let state = [];
    let result;

    beforeEach(async () => {
      code = await readFile(
        `${__dirname}/samples/interface-with-a-mix-of-properties.ts`
      );
      result = runTraverse(code, interfacesGet, state);
    });

    it("should identify that interface", () => {
      expect(state[0].name).toBe("IFoo");
    });

    it("should return the properties in an array", () => {
      expect(state[0].props).toEqual([
        stringWithKey("name"),
        numberWithKey("age"),
        anyWithKey("meta"),
      ]);
    });
  });

  describe("when given a code sample with an interface containing a tuple", () => {
    let code;
    let state = [];
    let result;

    beforeEach(async () => {
      code = await readFile(`${__dirname}/samples/interface-with-a-tuple.ts`);
      result = runTraverse(code, interfacesGet, state);
    });

    it("should identify that interface", () => {
      expect(state[0].name).toBe("IFoo");
    });

    it("should return that tuple in an array", () => {
      expect(state[0].props).toEqual([
        tupleWithKey(
          "history",
          "TSStringKeyword",
          "TSNumberKeyword",
          "TSAnyKeyword"
        ),
      ]);
    });
  });

  describe("when given a code sample with an interface containing a function", () => {
    let code;
    let state = [];
    let result;

    beforeEach(async () => {
      code = await readFile(
        `${__dirname}/samples/interface-with-a-function-type.ts`
      );
      result = runTraverse(code, interfacesGet, state);
    });

    it("should identify that interface", () => {
      expect(state[0].name).toBe("IFoo");
    });

    it("should store that function", () => {
      expect(state[0].props).toEqual([funcWithKey("func")]);
    });
  });
});
