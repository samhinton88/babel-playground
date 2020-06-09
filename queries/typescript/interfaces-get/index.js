const getValue = (typeAnnotation) => {
  switch (typeAnnotation.typeAnnotation.type) {
    case "TSTupleType":
      return typeAnnotation.typeAnnotation.elementTypes.map(
        (elType) => elType.type
      );

    default:
      return typeAnnotation.typeAnnotation.type;
  }
};

const interfacesGet = (state) => ({
  TSInterfaceDeclaration(path) {
    const name = path.node.id.name;
    const loc = path.node.loc;

    const props = [];

    path.traverse({
      TSPropertySignature(subPath) {
        const prop = subPath.node;
        props.push({
          key: prop.key.name,
          value: getValue(prop.typeAnnotation),
        });
      },
    });

    state.push({ name, props, loc });
  },
});

module.exports = interfacesGet;
