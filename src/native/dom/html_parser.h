#ifndef HTML_PARSER_H
#define HTML_PARSER_H

typedef struct Attribute {
    char* name;
    char* value;
    struct Attribute* next;
} Attribute;

typedef struct Node {
    char* tag;
    char* content;
    Attribute* attributes;
    struct Node* children;
    struct Node* next;
} Node;

Node* parse_html(const char* html);
Node* get_element_by_id(Node* root, const char* id);
Node* query_selector(Node* root, const char* selector);
Node* query_selector_all(Node* root, const char* selector);
Node* get_elements_by_class_name(Node* root, const char* class_name);
char* get_attribute(Node* node, const char* attribute_name);
void free_tree(Node* root);

#endif
