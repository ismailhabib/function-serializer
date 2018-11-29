# function-serializer

Function serializer is a small library to make your (asynchronous) JS function run in a sequential fashion by a queue of execution. Therefore, you can also do interesting stuffs like cancelling execution or prioritizing execution. It's heavily inspired by the actor model and basically is a stripped version of Actrix (https://github.com/ismailhabib/actrix).

## Why?

Sometimes you don't really have a full control over when your (asynchronous) function is triggered and you don't want the execution of the function to be overlapped with one another. The trigger typically comes from UI interactions or callbacks. To achieve this, you can serialize the execution of your function. This library should make it easier for you. Obviously, you can also do this with some other libraries (Redux Saga or RxJs come to mind), but this library will not try to force a completely different way of writing your code.

## Getting Started

Follow this instruction to get started with function-serializer.

### Installing

To use function-serializer on your project, install it using npm or yarn.

```
yarn add function-serializer
```

or

```
npm install function-serializer
```

## Usage Example

```Typescript
function delay(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time)
  })
}

let counter = 0;

async function myFunction() {
  await delay(100);
  console.log(counter++);
}

const serializedFunction = serialize(myFunction);

serializedFunction();
serializedFunction();
serializedFunction();
serializedFunction();
serializedFunction();
```
