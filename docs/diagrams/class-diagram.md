# Class Diagram

Class diagrams show the structure of a system using classes, attributes, methods, and relationships.

## Basic Class

```mermaid
classDiagram
  class Animal {
    +String name
    +int age
    +eat() void
    -sleep()
  }
```

## Relationships

### Inheritance

```mermaid
classDiagram
  Animal <|-- Dog
  Animal <|-- Cat
```

### Composition & Aggregation

```mermaid
classDiagram
  Car *-- Engine
  Library o-- Book
```

### Association & Dependency

```mermaid
classDiagram
  Teacher --> Student
  Client ..> Service
```

## Annotations

```mermaid
classDiagram
  class Shape
  <<Interface>> Shape
  class Circle
  Shape <|-- Circle
```

## Generic Types

```mermaid
classDiagram
  class List~T~ {
    +add(item T)
    +get(index int) T
    +size() int
  }
```

## Full Example

```mermaid
classDiagram
  class Vehicle {
    +String make
    +String model
    +start() void
    +stop() void
  }
  class Car {
    +int doors
    +drive() void
  }
  class Truck {
    +int payload
    +haul() void
  }
  class Engine {
    +int horsepower
    +rev() void
  }

  Vehicle <|-- Car
  Vehicle <|-- Truck
  Vehicle *-- Engine
```
