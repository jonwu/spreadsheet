import React from "react";
import { View, Text, TextInput } from "react-native";
import _ from "lodash";
import create from "zustand";

// For this challenge, I want you to render four cells, respectively labeled A-D. Each cell should
// contain a text input that the user can type into. Each cell should also display a number.

// The user can type into each cell. If the text input contains a number, the cell should render that number.
// A cell can also contain a string satisfying the regex [A-D]+. If the input contains letters,
// it should show the sum of the referenced cells. For example, "AD" represents the sum of cell A and cell D.

// 1. What does the cell render if input is nothing?
// 2. Can the input contain both a number AND letter?
// 3. Can the input be something like "ABjonwu"? Are these invalid inputs?
// 4. What happens to the sum if a cell's input is AB, but both A and B are empty?
// 5. If the input is "AAA" do we sum A 3 times?
// 6. What are some edge cases i should consider?

const useStore = create((_set) => ({
  A: { number: NaN, deps: new Set() },
  B: { number: NaN, deps: new Set() },
  C: { number: NaN, deps: new Set() },
  D: { number: NaN, deps: new Set() },
}));

const setStore = (letter, update) => {
  const data = useStore.getState();
  useStore.setState({ ...data, [letter]: { ...data[letter], ...update } });
};

const useSum = (key, value) => {
  const letters = getLetters(value);

  return useStore((state) => {
    if (letters == null) return NaN;
    let sum = 0;

    for (let i = 0; i < letters.length; i++) {
      const letter = letters[i];
      const { deps } = state[letter];

      // handle dependency case. ie B = A, A = B
      if (deps.has(key)) return NaN;
      sum += state[letter].number;
    }

    return sum;
  });
};

const getNumber = (text) => {
  if (isNaN(text)) return NaN;
  return parseInt(text);
};

const getLetters = (text) => {
  const letters = text.match(/[A-D]+/g);
  if (letters == null || letters[0] !== text) return null;
  return letters[0].split("");
};

const isValidInput = (text, sum) => {
  const letters = getLetters(text);
  const number = getNumber(text);

  if (text === "") return true;
  if (!isNaN(number) && !letters) return true;
  if (isNaN(number) && letters && !isNaN(sum)) return true;

  return false;
};

const Cell = React.memo(({ letter, number }) => {
  const [value, setValue] = React.useState("");
  const sum = useSum(letter, value);
  const isValid = isValidInput(value, sum);
  const result = number || "";

  React.useEffect(() => {
    setStore(letter, { number: sum });
  }, [sum]);

  return (
    <View style={{ flexDirection: "row", padding: 16, alignItems: "center" }}>
      <Text style={{ marginRight: 16 }}>{letter}</Text>
      <TextInput
        style={{ width: 100, marginRight: 16, backgroundColor: "lightgray" }}
        value={value}
        onChangeText={(text) => {
          const number = getNumber(text);
          const letters = getLetters(text);
          const deps = new Set(letters);

          setStore(letter, { number, deps });
          setValue(text);
        }}
      />
      <Text>{isValid ? result : "invalid input"}</Text>
    </View>
  );
});

function App() {
  const data = useStore();

  return (
    <View style={{ flex: 1, justifyContent: "center" }}>
      {Object.entries(data).map(([letter, { number }]) => {
        return <Cell letter={letter} number={number} key={letter} />;
      })}
    </View>
  );
}

export default App;
